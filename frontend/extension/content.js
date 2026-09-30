(function () {
    "use strict";

    console.log("SGP Token Optimizer content.js loaded");

    // ============================================================
    // CONFIG
    // ============================================================

    const BUTTON_ID = "sgp-token-optimizer-button";

    const MIN_LONG_PROMPT_LENGTH = 500;

    const BUTTON_SIZE = 38;

    const GAP = 4;

    let button = null;

    let positionInterval = null;

    let isOptimizing = false;


    // ============================================================
    // HELPER: VISIBLE ELEMENT
    // ============================================================

    function isVisible(element) {

        if (!element) {
            return false;
        }

        const rect =
            element.getBoundingClientRect();

        const style =
            window.getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
        );
    }


    // ============================================================
    // FIND THINK BUTTON
    // ============================================================

    function findThinkButton() {

        const buttons =
            document.querySelectorAll("button");

        let thinkButtons = [];


        for (const btn of buttons) {

            if (!isVisible(btn)) {
                continue;
            }


            const text =
                (
                    btn.innerText ||
                    btn.textContent ||
                    ""
                )
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase();


            const aria =
                (
                    btn.getAttribute("aria-label") ||
                    ""
                ).toLowerCase();


            const title =
                (
                    btn.getAttribute("title") ||
                    ""
                ).toLowerCase();


            if (
                text === "think" ||
                aria.includes("think") ||
                title.includes("think")
            ) {

                thinkButtons.push(btn);
            }
        }


        if (!thinkButtons.length) {
            return null;
        }


        // Prefer the Think button closest to the bottom
        thinkButtons.sort(
            (a, b) => {

                const aRect =
                    a.getBoundingClientRect();

                const bRect =
                    b.getBoundingClientRect();

                return bRect.top - aRect.top;
            }
        );


        return thinkButtons[0];
    }


    // ============================================================
    // FIND CHATGPT TEXTBOX
    // ============================================================
    
    function findChatGPTTextbox() {

        // First preference
        const promptTextarea =
            document.querySelector(
                "#prompt-textarea"
            );


        if (
            promptTextarea &&
            isVisible(promptTextarea)
        ) {

            return promptTextarea;
        }


        // Second preference
        const textareas =
            document.querySelectorAll(
                "textarea"
            );


        for (const textarea of textareas) {

            if (isVisible(textarea)) {
                return textarea;
            }
        }


        // Third preference
        const contenteditables =
            document.querySelectorAll(
                '[contenteditable="true"]'
            );


        const visibleEditors = [];


        for (
            const editor of contenteditables
        ) {

            if (!isVisible(editor)) {
                continue;
            }


            const rect =
                editor.getBoundingClientRect();


            visibleEditors.push({
                element: editor,
                bottom: rect.bottom
            });
        }


        if (visibleEditors.length) {

            visibleEditors.sort(
                (a, b) =>
                    b.bottom - a.bottom
            );


            return visibleEditors[0].element;
        }


        return null;
    }


    // ============================================================
    // GET PROMPT TEXT
    // ============================================================

    function getTextboxText() {

        const textbox =
            findChatGPTTextbox();


        if (!textbox) {
            return "";
        }


        if (
            textbox.tagName === "TEXTAREA" ||
            textbox.tagName === "INPUT"
        ) {

            return textbox.value || "";
        }


        return (
            textbox.innerText ||
            textbox.textContent ||
            ""
        );
    }


    // ============================================================
    // CREATE SGP BUTTON
    // ============================================================

    function createSGPButton() {

        // Already exists
        const existing =
            document.getElementById(
                BUTTON_ID
            );


        if (existing) {

            button = existing;

            return existing;
        }


        // --------------------------------------------------------
        // CREATE
        // --------------------------------------------------------

        button =
            document.createElement("button");


        button.id =
            BUTTON_ID;


        button.type =
            "button";


        button.setAttribute(
            "aria-label",
            "SGP Token Optimizer"
        );


        button.title =
            "SGP Token Optimizer";


        // --------------------------------------------------------
        // WAND + SPARKLES ICON
        // --------------------------------------------------------

        button.innerHTML = `

            <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >

                <!-- Wand -->
                <path
                    d="M4.5 19.5L15.8 8.2"
                    stroke="white"
                    stroke-width="2.8"
                    stroke-linecap="round"
                />

                <!-- Main sparkle -->
                <path
                    d="
                        M15.8 3.2
                        L16.7 5.8
                        L19.3 6.7
                        L16.7 7.6
                        L15.8 10.2
                        L14.9 7.6
                        L12.3 6.7
                        L14.9 5.8
                        Z
                    "
                    fill="white"
                />

                <!-- Medium sparkle -->
                <path
                    d="
                        M19.2 10.5
                        L19.8 12.2
                        L21.5 12.8
                        L19.8 13.4
                        L19.2 15.1
                        L18.6 13.4
                        L16.9 12.8
                        L18.6 12.2
                        Z
                    "
                    fill="white"
                />

                <!-- Small sparkle -->
                <path
                    d="
                        M8.3 5.2
                        L8.8 6.6
                        L10.2 7.1
                        L8.8 7.6
                        L8.3 9
                        L7.8 7.6
                        L6.4 7.1
                        L7.8 6.6
                        Z
                    "
                    fill="white"
                />

                <!-- Tiny sparkle -->
                <path
                    d="
                        M20.5 4
                        L20.8 4.9
                        L21.7 5.2
                        L20.8 5.5
                        L20.5 6.4
                        L20.2 5.5
                        L19.3 5.2
                        L20.2 4.9
                        Z
                    "
                    fill="white"
                />

            </svg>

        `;


        // --------------------------------------------------------
        // BUTTON STYLE
        // --------------------------------------------------------

        button.style.position =
            "fixed";

        button.style.width =
            `${BUTTON_SIZE}px`;

        button.style.height =
            `${BUTTON_SIZE}px`;

        button.style.minWidth =
            `${BUTTON_SIZE}px`;

        button.style.minHeight =
            `${BUTTON_SIZE}px`;

        button.style.padding =
            "0";

        button.style.margin =
            "0";

        button.style.border =
            "none";

        button.style.borderRadius =
            "50%";

        button.style.background =
            "#3b82f6";

        button.style.color =
            "white";

        button.style.display =
            "flex";

        button.style.alignItems =
            "center";

        button.style.justifyContent =
            "center";

        button.style.cursor =
            "pointer";

        button.style.outline =
            "none";

        button.style.zIndex =
            "2147483647";

        button.style.boxShadow =
            "none";

        button.style.transition =
            "background 0.15s ease, " +
            "transform 0.1s ease, " +
            "box-shadow 0.2s ease";

        button.style.fontFamily =
            "Arial, sans-serif";

        button.style.lineHeight =
            "1";

        button.dataset.longPrompt =
            "false";


        // --------------------------------------------------------
        // HOVER
        // --------------------------------------------------------

        button.addEventListener(
            "mouseenter",
            function () {

                if (
                    button.disabled ||
                    isOptimizing
                ) {
                    return;
                }


                const isLongPrompt =
                    button.dataset.longPrompt ===
                    "true";


                button.style.background =
                    isLongPrompt
                        ? "#16a34a"
                        : "#2563eb";


                button.style.transform =
                    "scale(1.04)";


                button.style.boxShadow =
                    isLongPrompt
                        ? "0 0 0 3px rgba(34,197,94,0.25), 0 4px 14px rgba(34,197,94,0.45)"
                        : "0 4px 12px rgba(59,130,246,0.30)";
            }
        );


        // --------------------------------------------------------
        // MOUSE LEAVE
        // --------------------------------------------------------

        button.addEventListener(
            "mouseleave",
            function () {

                if (
                    button.disabled ||
                    isOptimizing
                ) {
                    return;
                }


                updateSGPButtonState();


                button.style.transform =
                    "scale(1)";
            }
        );


        // --------------------------------------------------------
        // MOUSE DOWN
        // --------------------------------------------------------

        button.addEventListener(
            "mousedown",
            function () {

                if (
                    button.disabled ||
                    isOptimizing
                ) {
                    return;
                }


                button.style.transform =
                    "scale(0.94)";
            }
        );


        // --------------------------------------------------------
        // MOUSE UP
        // --------------------------------------------------------

        button.addEventListener(
            "mouseup",
            function () {

                if (
                    button.disabled ||
                    isOptimizing
                ) {
                    return;
                }


                button.style.transform =
                    "scale(1.04)";
            }
        );


        // --------------------------------------------------------
        // CLICK
        // --------------------------------------------------------

        button.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();

                await optimizeCurrentPrompt();
            }
        );


        // --------------------------------------------------------
        // APPEND DIRECTLY TO BODY
        // --------------------------------------------------------

        document.body.appendChild(
            button
        );


        console.log(
            "SGP button created"
        );


        return button;
    }


    // ============================================================
    // POSITION BUTTON
    // ============================================================

    function positionSGPButton() {

        if (!button) {
            return;
        }


        if (
            !document.body.contains(button)
        ) {
            return;
        }


        const thinkButton =
            findThinkButton();


        if (!thinkButton) {
            return;
        }


        const rect =
            thinkButton.getBoundingClientRect();


        // --------------------------------------------------------
        // SGP LEFT OF THINK
        // --------------------------------------------------------

        const left =
            rect.left -
            BUTTON_SIZE -
            GAP;


        const top =
            rect.top +
            (
                rect.height -
                BUTTON_SIZE
            ) / 2;


        button.style.left =
            `${Math.round(left)}px`;


        button.style.top =
            `${Math.round(top)}px`;
    }


    // ============================================================
    // UPDATE BLUE / GREEN
    // ============================================================

    function updateSGPButtonState() {

        if (!button) {
            return;
        }


        if (
            !document.body.contains(button)
        ) {
            return;
        }


        const prompt =
            getTextboxText();


        const characterCount =
            prompt.length;


        const isLongPrompt =
            characterCount >=
            MIN_LONG_PROMPT_LENGTH;


        button.dataset.longPrompt =
            isLongPrompt
                ? "true"
                : "false";


        console.log(
            "SGP character count:",
            characterCount
        );


        if (isOptimizing) {
            return;
        }


        if (isLongPrompt) {

            // GREEN
            button.style.background =
                "#22c55e";


            button.style.boxShadow =
                "0 0 0 3px rgba(34,197,94,0.25), " +
                "0 4px 14px rgba(34,197,94,0.45)";

        } else {

            // BLUE
            button.style.background =
                "#3b82f6";


            button.style.boxShadow =
                "none";
        }
    }


    // ============================================================
    // INSERT OPTIMIZED PROMPT
    // ============================================================

    function insertOptimizedPrompt(text) {

        const textbox =
            findChatGPTTextbox();


        if (!textbox) {

            alert(
                "ChatGPT textbox not found."
            );

            return false;
        }


        textbox.focus();


        // --------------------------------------------------------
        // TEXTAREA
        // --------------------------------------------------------

        if (
            textbox.tagName === "TEXTAREA" ||
            textbox.tagName === "INPUT"
        ) {

            const prototype =
                textbox.tagName ===
                "TEXTAREA"
                    ? HTMLTextAreaElement.prototype
                    : HTMLInputElement.prototype;


            const valueSetter =
                Object.getOwnPropertyDescriptor(
                    prototype,
                    "value"
                )?.set;


            if (valueSetter) {

                valueSetter.call(
                    textbox,
                    text
                );

            } else {

                textbox.value =
                    text;
            }


            textbox.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );


            textbox.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );


            return true;
        }


        // --------------------------------------------------------
        // CONTENTEDITABLE
        // --------------------------------------------------------

        const selection =
            window.getSelection();


        const range =
            document.createRange();


        range.selectNodeContents(
            textbox
        );


        selection.removeAllRanges();


        selection.addRange(
            range
        );


        let inserted = false;


        try {

            inserted =
                document.execCommand(
                    "insertText",
                    false,
                    text
                );

        } catch (error) {

            console.warn(
                "execCommand failed",
                error
            );
        }


        if (!inserted) {

            textbox.innerHTML = "";


            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                text;


            textbox.appendChild(
                div
            );


            textbox.dispatchEvent(
                new InputEvent(
                    "input",
                    {
                        bubbles: true,
                        inputType:
                            "insertText",
                        data:
                            text
                    }
                )
            );
        }


        return true;
    }
    // ============================================================
// RECEIVE INSERT REQUEST FROM POPUP
// ============================================================

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {

        if (
            message &&
            message.action === "INSERT_OPTIMIZED_PROMPT"
        ) {

            console.log(
                "SGP: Received optimized prompt from popup."
            );

            const success =
                insertOptimizedPrompt(
                    message.prompt || ""
                );

            sendResponse({
                success: success
            });

            return true;
        }
    }
);

    // ============================================================
    // OPTIMIZE CURRENT PROMPT
    // ============================================================

    async function optimizeCurrentPrompt() {

        if (isOptimizing) {
            return;
        }


        const prompt =
            getTextboxText().trim();


        // --------------------------------------------------------
        // EMPTY
        // --------------------------------------------------------

        if (!prompt) {

            alert(
                "Please enter a prompt first."
            );

            return;
        }


        // --------------------------------------------------------
        // BUTTON
        // --------------------------------------------------------

        if (!button) {
            return;
        }


        isOptimizing =
            true;


        const oldHTML =
            button.innerHTML;


        const oldBackground =
            button.style.background;


        // --------------------------------------------------------
        // LOADING
        // --------------------------------------------------------

        button.disabled =
            true;


        button.style.cursor =
            "wait";


        button.style.opacity =
            "0.85";


        button.style.transform =
            "scale(0.96)";


        button.style.background =
            "#16a34a";


        button.style.boxShadow =
            "0 0 0 3px rgba(34,197,94,0.25), " +
            "0 4px 14px rgba(34,197,94,0.45)";


        button.innerHTML = `

            <span
                style="
                    color:white;
                    font-size:17px;
                    font-weight:700;
                    line-height:1;
                "
            >
                ...
            </span>

        `;


        try {

            console.log(
                "Sending prompt to background..."
            );


            // ====================================================
            // BACKGROUND.JS
            // ====================================================

            const result =
                await new Promise(
                    function (resolve) {

                        chrome.runtime.sendMessage(
                            {
                                action:
                                    "PROMPT_DIRECT",

                                prompt:
                                    prompt,

                                ai_model:
                                    "gemini",

                            },

                            function (response) {

                                if (
                                    chrome.runtime.lastError
                                ) {

                                    resolve({
                                        success:
                                            false,

                                        error:
                                            chrome.runtime
                                                .lastError
                                                .message
                                    });

                                    return;
                                }


                                resolve(
                                    response
                                );
                            }
                        );
                    }
                );


            console.log(
                "SGP result:",
                result
            );


            // ----------------------------------------------------
            // ERROR
            // ----------------------------------------------------

            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.error ||
                    "Could not optimize the prompt."
                );
            }


            // ----------------------------------------------------
            // GET OPTIMIZED PROMPT
            // ----------------------------------------------------

            const optimizedPrompt =
                result.optimized_prompt;


            if (!optimizedPrompt) {

                throw new Error(
                    "No optimized prompt received from server."
                );
            }


            // ----------------------------------------------------
            // INSERT
            // ----------------------------------------------------

            const success =
                insertOptimizedPrompt(
                    optimizedPrompt
                );


            if (!success) {

                throw new Error(
                    "Could not insert optimized prompt."
                );
            }


            console.log(
                "Optimized prompt inserted successfully."
            );


            // ----------------------------------------------------
            // SUCCESS ICON
            // ----------------------------------------------------

            button.innerHTML = `

                <span
                    style="
                        color:white;
                        font-size:18px;
                        font-weight:700;
                        line-height:1;
                    "
                >
                    ✓
                </span>

            `;


            button.style.background =
                "#16a34a";


            button.style.boxShadow =
                "0 0 0 3px rgba(34,197,94,0.25), " +
                "0 4px 14px rgba(34,197,94,0.45)";


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1200
                    )
            );


        } catch (error) {

            console.error(
                "SGP optimization error:",
                error
            );


            alert(
                error.message ||
                "Could not connect to the SGP Token Optimizer server."
            );

        } finally {

            // ----------------------------------------------------
            // RESTORE BUTTON
            // ----------------------------------------------------

            button.innerHTML =
                oldHTML;


            button.disabled =
                false;


            button.style.cursor =
                "pointer";


            button.style.opacity =
                "1";


            button.style.transform =
                "scale(1)";


            isOptimizing =
                false;


            // Recalculate state
            updateSGPButtonState();
        }
    }


    // ============================================================
    // PROMPT INPUT MONITOR
    // ============================================================

    // ============================================================
// PROMPT DETECTION + MONITOR
// ============================================================

function setupPromptMonitor() {

    // --------------------------------------------------------
    // HANDLE PROMPT CHANGE
    // --------------------------------------------------------

    async function handlePromptChange() {

        const prompt =
            getTextboxText();


        console.log(
            "SGP detected prompt:",
            prompt
        );


        // ----------------------------------------------------
        // SAVE PROMPT FOR EXTENSION
        // ----------------------------------------------------

        try {

            await chrome.storage.local.set({

                detectedPrompt:
                    prompt,

                source:
                    "chatgpt"

            });

        } catch (error) {

            console.error(
                "Could not save detected prompt:",
                error
            );
        }


        // ----------------------------------------------------
        // SEND TO POPUP IF OPEN
        // ----------------------------------------------------

        try {

            chrome.runtime.sendMessage({

                action:
                    "PROMPT_DETECTED",

                prompt:
                    prompt,

                source:
                    "chatgpt"

            });

        } catch (error) {

            /*
             * Popup may not be open.
             * This is normal and can be ignored.
             */

            console.log(
                "Extension popup is not open."
            );
        }


        // ----------------------------------------------------
        // UPDATE BUTTON
        // ----------------------------------------------------

        updateSGPButtonState();
    }


    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    document.addEventListener(
        "input",
        function (event) {

            const textbox =
                findChatGPTTextbox();


            if (
                textbox &&
                (
                    event.target === textbox ||
                    textbox.contains(event.target)
                )
            ) {

                handlePromptChange();
            }

        },
        true
    );


    // --------------------------------------------------------
    // KEYUP
    // --------------------------------------------------------

    document.addEventListener(
        "keyup",
        function (event) {

            const textbox =
                findChatGPTTextbox();


            if (
                textbox &&
                (
                    event.target === textbox ||
                    textbox.contains(event.target)
                )
            ) {

                handlePromptChange();
            }

        },
        true
    );


    // --------------------------------------------------------
    // PASTE
    // --------------------------------------------------------

    document.addEventListener(
        "paste",
        function (event) {

            const textbox =
                findChatGPTTextbox();


            if (
                textbox &&
                (
                    event.target === textbox ||
                    textbox.contains(event.target)
                )
            ) {

                setTimeout(
                    function () {

                        handlePromptChange();

                    },
                    50
                );


                setTimeout(
                    function () {

                        handlePromptChange();

                    },
                    300
                );
            }

        },
        true
    );


    // --------------------------------------------------------
    // CUT
    // --------------------------------------------------------

    document.addEventListener(
        "cut",
        function (event) {

            const textbox =
                findChatGPTTextbox();


            if (
                textbox &&
                (
                    event.target === textbox ||
                    textbox.contains(event.target)
                )
            ) {

                setTimeout(
                    function () {

                        handlePromptChange();

                    },
                    50
                );
            }

        },
        true
    );


    // --------------------------------------------------------
    // BACKUP CHECK
    // --------------------------------------------------------

    setInterval(
        function () {

            const prompt =
                getTextboxText();


            updateSGPButtonState();


            /*
             * Keep detectedPrompt synchronized even when
             * ChatGPT changes its DOM without firing a normal
             * input event.
             */

            chrome.storage.local.set({

                detectedPrompt:
                    prompt,

                source:
                    "chatgpt"

            }).catch(
                () => {}
            );

        },
        700
    );


    console.log(
        "SGP prompt detection enabled"
    );
}

    // ============================================================
    // SIMPLE POSITION MONITOR
    // ============================================================

    function setupPositionMonitor() {

        // Initial
        positionSGPButton();


        // Small interval only for positioning.
        // We are NOT observing ChatGPT's entire DOM.
        positionInterval =
            setInterval(
                function () {

                    positionSGPButton();

                },
                1000
            );


        // Window resize
        window.addEventListener(
            "resize",
            function () {

                positionSGPButton();

            }
        );


        // Scroll
        window.addEventListener(
            "scroll",
            function () {

                positionSGPButton();

            },
            true
        );
    }


    // ============================================================
    // INITIALIZE
    // ============================================================

    function initialize() {

        console.log(
            "Initializing SGP Token Optimizer..."
        );


        // Wait until body exists
        if (!document.body) {

            setTimeout(
                initialize,
                500
            );

            return;
        }


        // Create ONLY ONE button
        createSGPButton();


        // Position
        positionSGPButton();


        // Monitor prompt
        setupPromptMonitor();


        // Monitor button position
        setupPositionMonitor();


        // Initial state
        setTimeout(
            function () {

                positionSGPButton();

                updateSGPButtonState();

            },
            500
        );


        console.log(
            "SGP Token Optimizer ready."
        );
    }


    // ============================================================
    // START
    // ============================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();