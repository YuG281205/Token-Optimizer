const API_BASE_URL =
    "http://127.0.0.1:8000/api";


console.log(
    "SGP Token Optimizer background service started"
);
// ============================================================
// PROMPT DETECTED FROM CHATGPT
// ============================================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            message.action !==
            "PROMPT_DETECTED"
        ) {
            return;
        }


        console.log(
            "SGP received prompt from ChatGPT:",
            message.prompt
        );


        chrome.storage.local.set({

            detectedPrompt:
                message.prompt || "",

            source:
                "chatgpt"

        });


        sendResponse({
            success: true
        });


        return true;
    }
);

// ============================================================
// MESSAGE LISTENER
// ============================================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            message.action !==
            "OPTIMIZE_PROMPT"
        ) {

            return;
        }


        optimizePrompt(
            message.prompt,
            message.ai_model,
            message.optimization_level
        )
            .then(
                (result) => {

                    sendResponse(result);

                }
            )
            .catch(
                (error) => {

                    console.error(
                        "Background optimization error:",
                        error
                    );


                    sendResponse({
                        success: false,

                        error:
                            error.message ||
                            "Failed to connect to SGP server."
                    });
                }
            );


        /*
         * VERY IMPORTANT:
         *
         * Returning true keeps the message channel
         * open while fetch() is running.
         */

        return true;
    }
);


// ============================================================
// OPTIMIZE PROMPT
// ============================================================

async function optimizePrompt(
    prompt,
    aiModel,
    optimizationLevel
) {

    // --------------------------------------------------------
    // GET JWT
    // --------------------------------------------------------

    const storage =
        await chrome.storage.local.get(
            [
                "accessToken",
                "refreshToken"
            ]
        );


    const accessToken =
        storage.accessToken;


    if (!accessToken) {

        return {

            success: false,

            error:
                "Please login to SGP Token Optimizer first."
        };
    }


    // --------------------------------------------------------
    // API REQUEST
    // --------------------------------------------------------

    console.log(
        "Background sending request to:",
        `${API_BASE_URL}/optimize/`
    );


    const response =
        await fetch(
            `${API_BASE_URL}/optimize/`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${accessToken}`
                },

                body:
                    JSON.stringify({

                        prompt:
                            prompt,

                        ai_model:
                            aiModel ||
                            "gemini",

                        optimization_level:
                            optimizationLevel ||
                            "balanced"
                    })
            }
        );


    console.log(
        "Django response:",
        response.status
    );


    // --------------------------------------------------------
    // 401
    // --------------------------------------------------------

    if (
        response.status === 401
    ) {

        await chrome.storage.local.remove(
            [
                "accessToken",
                "refreshToken"
            ]
        );


        return {

            success: false,

            error:
                "Your login session expired. Please login again."
        };
    }


    // --------------------------------------------------------
    // OTHER ERROR
    // --------------------------------------------------------

    if (!response.ok) {

        const errorText =
            await response.text();


        console.error(
            "Django API error:",
            errorText
        );


        return {

            success: false,

            error:
                `Django API error ${response.status}: ${errorText}`
        };
    }


    // --------------------------------------------------------
    // JSON
    // --------------------------------------------------------

    const data =
        await response.json();


    console.log(
        "Django optimization result:",
        data
    );


    // --------------------------------------------------------
    // OPTIMIZED PROMPT
    // --------------------------------------------------------

    const optimizedPrompt =
        data.optimized_prompt ||
        data.optimizedPrompt ||
        data.result ||
        data.optimized ||
        data.prompt;


    if (!optimizedPrompt) {

        return {

            success: false,

            error:
                "Django returned a response, but no optimized prompt was found."
        };
    }


    return {

        success: true,

        optimized_prompt:
            optimizedPrompt,

        data:
            data
    };
}
// ============================================================
// DIRECT PROMPTING / FAST OPTIMIZE
// ============================================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.action !== "PROMPT_DIRECT") {
            return;
        }

        directPrompt(
            message.prompt,
            message.ai_model
        )
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {

                console.error(
                    "Direct prompting error:",
                    error
                );

                sendResponse({
                    success: false,
                    error:
                        error.message ||
                        "Failed to connect to SGP server."
                });
            });

        return true;
    }
);


// ============================================================
// DIRECT PROMPTING API
// ============================================================

async function directPrompt(
    prompt,
    aiModel
) {

    const storage =
        await chrome.storage.local.get([
            "accessToken",
            "refreshToken"
        ]);

    const accessToken =
        storage.accessToken;

    if (!accessToken) {

        return {
            success: false,
            error:
                "Please login to SGP Token Optimizer first."
        };
    }


    console.log(
        "Background sending FAST prompt request to:",
        `${API_BASE_URL}/prompting/`
    );


    const response =
        await fetch(
            `${API_BASE_URL}/prompting/`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${accessToken}`
                },

                body:
                    JSON.stringify({

                        prompt:
                            prompt,

                        ai_model:
                            aiModel ||
                            "gemini",
                        optimization_level: "balanced"
                    })
            }
        );


    console.log(
        "Django prompting response:",
        response.status
    );


    if (response.status === 401) {

        await chrome.storage.local.remove([
            "accessToken",
            "refreshToken"
        ]);

        return {
            success: false,
            error:
                "Your login session expired. Please login again."
        };
    }


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "Django prompting API error:",
            errorText
        );

        return {
            success: false,
            error:
                `Django API error ${response.status}: ${errorText}`
        };
    }


    const data =
        await response.json();


    console.log(
        "Django direct prompting result:",
        data
    );


    const optimizedPrompt =
        data.optimized_prompt ||
        data.optimizedPrompt ||
        data.result ||
        data.optimized ||
        data.prompt;


    if (!optimizedPrompt) {

        return {
            success: false,
            error:
                "Django returned a response, but no optimized prompt was found."
        };
    }


    return {

        success: true,

        optimized_prompt:
            optimizedPrompt,

        data:
            data
    };
}