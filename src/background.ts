import { browser } from "webextension-polyfill-ts";

const ZENDESK_URLS = ["http://*.zendesk.com/*", "https://*.zendesk.com/*"];

// Maps Zendesk subdomains to the ID of the master tab for that subdomain
let masters: Map<string, number> = new Map();

browser.tabs.onUpdated.addListener(async (tabID, info) => {
    // If URL hasn't changed, we don't care
    if (!info.url) {
        return;
    } else if (isZendeskURL(info.url!)) {
        console.log(`Tab ${tabID} changed to a Zendesk URL`);
        let subdomain = getSubdomain(info.url!);
        let master = masters.get(subdomain);

        if (master === undefined) {
            await updateMasters();
        } else {
            await merge(tabID, master);
        }
    } else {
        console.log(`Tab ${tabID} changed to a non-Zendesk URL`);
        // This is going to get called a lot unnecessarily
        await updateMasters();
    }
});

// Update masters if a Zendesk tab is closed
browser.tabs.onRemoved.addListener(async (tabID, _) => {
    if (!await isZendeskTab(tabID)) return;
    console.log(`Zendesk tab with ID ${tabID} closed`);
    await updateMasters();
});

/**
 * Remove any bad entries from masters, and discover any new Zendesk tabs
 * for subdomains not already covered
 */
async function updateMasters() {
    console.log("Updating masters")
    // Iterate over all masters and remove any bad entries (closed tabs or no longer on the same subdomain)
    for (let entry of masters.entries()) {
        let [subdomain, tabID] = entry;
        try {
            let tab = await browser.tabs.get(tabID);
            // At this point we know a tab still exists with the ID
            // So long as this if statement isn't true, we want to leave this entry intact
            if (getSubdomain(tab.url!) !== subdomain) {
                // We hit this condition in the case that a Zendesk tab changed to a different subdomain
                masters.delete(subdomain);
            }
        } catch (err) {
            // Failed to access tab, probably closed, remove from masters
            console.log("Getting tabID failed");
            console.log(err);
            masters.delete(subdomain);
        }
    }

    // Iterate over all Zendesk tabs and add their ID to masters if the subdomain isn't recognised
    for (let tab of await browser.tabs.query({ url: ZENDESK_URLS })) {
        let subdomain = getSubdomain(tab.url!);
        if (!masters.has(subdomain)) {
            masters.set(subdomain, tab.id!);
        }
    }
}

// TODO: take implementation from Zendesk QuickTab
async function merge(into: number, master: number) {
    alert(`Pretend I merged tab ${into} into tab ${master}`);
    await browser.tabs.discard(into);
}

function getSubdomain(urlString: string): string {
    let url = new URL(urlString);
    let parts = url.hostname.split('.');
    if (parts.length <= 2) {
        return "";
    } else {
        // Could be more robust
        return parts[0];
    }
}

async function isZendeskTab(tabID: number): Promise<boolean> {
    let tab = await browser.tabs.get(tabID);
    return isZendeskURL(tab.url!);
}

function isZendeskURL(urlString: string): boolean {
    let url = new URL(urlString);
    return url.hostname.endsWith("zendesk.com");
}
