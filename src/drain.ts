import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    const moneyThresh = ns.getServerMaxMoney();

    // Defines the minimum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel();
    
    // Infinite loop that continously hacks/grows/weakens the target server
    while(true) {
        if (ns.getServerSecurityLevel() > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken();
        } else if (ns.getServerMoneyAvailable() < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow();
        } else {
            // Otherwise, hack it
            await ns.hack();
        }
    }
}