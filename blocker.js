/**
 * Only four languages supported at this time. To add another, insert it as
 * an entry into the languages object, using  the language code as the key
 * and the translation of 'Sponsored' (lowercase) as the value.
 */

const languages = {
    "en": "sponsored",
    "pt": "patrocinado",
    "es": "publicidad",
    "fr": "sponsorisé"
};

main();

function hasSponsoredText(element) {

    let message = "";

    /**
     * Facebook's 'Sponsored' text consists of visble and invisible span elements.
     * We filter-out the invisible ones, and determine the text remaining in the rest.
     */

    for (const node of element.childNodes) {
        if (node instanceof Element && node.hasAttribute("style") === false) {
            message = message + node.textContent;
        } else if (node instanceof Text) {
            message = message + node.nodeValue;
        }
    }

    return Object.values(languages).includes(message.toLowerCase());

}

function removeSponsored(node) {

    /**
     * Performance monitoring
     */

    const start = performance.now();

    /**
     * The elements we'd like to target have some variability in how
     * their style values appear. We use a basic 'starts-with' selector.
     */

    const elementList = node.querySelectorAll("span[style^='position']");

    if (elementList.length > 0) {

        for (const element of elementList) {

            /**
             * Handing it off to hasSponsoredText to see if the element's siblings
             * form the target text. Important to pass the parentElement here as the
             * childNodes are queried and reviewed.
             */

            if (hasSponsoredText(element.parentElement)) {

                /**
                 * Sponsored content in the main feed is nested within a [role='article']
                 * element. Similar content on the right-column is not. We look for either
                 * pattern in the element's path.
                 */

                const container = element.closest("[role='article'], div > span > div");

                /**
                 * The final stage is to remove the Sponsored content from the page.
                 */

                if (container instanceof Element) {
                    container.remove();
                    console.log("Removed an item.");
                }
            }
        }
    }

    const runtime = (performance.now() - start).toFixed(3);
    console.info(`Handled ${elementList.length} items in ${runtime}ms`);

};

function setupObserver(root, handler) {

    /**
     * Call the handler once up front to catch anything
     * that might have been present in the initial HTML.
     */

    handler(root);

    /**
     * Bind a mutation observer to the root element, so that
     * we can be informed of added nodes.
     */

    const options = { childList: true, subtree: true };
    const observer = new MutationObserver(changes => {

        console.group(`Mutation Event Group: ${Date.now()}`);
        const start = performance.now();

        for (const change of changes) {
            for (const node of change.addedNodes) {
                if (node instanceof Element) {
                    handler(node);
                }
            }
        }

        const runtime = (performance.now() - start).toFixed(3);
        console.log(`Total Time: ${runtime}ms`);
        console.groupEnd();

    });

    observer.observe(root, options);

}

function main() {

    const language = document.documentElement.lang;

    /**
     * If we don't support the user's language, we shouldn't
     * proceed to setup any mutation observers.
     */

    if (language && language in languages === false) {
        console.warn(`${language} is not supported at this time.`);
        return;
    }

    /**
     * Listening for mutations from the documentElement, since it
     * will persist as the user moves around Facebook.
     */

    setupObserver(document.documentElement, removeSponsored);

}
