import { browser } from "webextension-polyfill-ts";

// TODO: account for incompatible subdomains
const ZENDESK_URLS = ["http://*.zendesk.com/*", "https://*.zendesk.com/*"];

class MasterTab {
    private id: number | null

    constructor() {
        this.id = null;
    }

    /**
     * Get current master tab ID
     * Checked to make sure it is valid
     * If the current ID is null or no longer valid, tries to get a new one using findMasterTab()
     */
    async getID(): Promise<number> {
        if (this.id !== null) {
            this.id = await browser.tabs.get(this.id)
                .then(tab => tab.id!)
                .catch(_ => this.findMasterTab());
        } else {
            console.log("Searching for Zendesk tab to make master");
            this.id = await this.findMasterTab();
        }
        return this.id;
    }

    /**
     * Get ID of first Zendesk tab if it exists
     */
    private async findMasterTab(): Promise<number | null> {
        let tabs = await browser.tabs.query({ url: ZENDESK_URLS });
        if (tabs.length == 0) {
            console.error("No Zendesk tab found to consider master");
            return null;
        } else {
            return tabs[0].id!;
        }
    }
}

let masterTab = new MasterTab();

browser.tabs.onUpdated.addListener(async (id, _) => {
    let masterID = await masterTab.getID();
    if (id === masterID) {
        return;
    }
    
    // Make ZD master tab active
    browser.tabs.update(masterID, { active: true, highlighted: true });
    // TODO: merge
}, { urls: ZENDESK_URLS });
