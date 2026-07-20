import { NS, Server } from "@ns";

function canNuke(ns: NS, server: Server): boolean {
    let hackingLevelHighEnough: boolean = server.requiredHackingSkill != undefined && 
        server.requiredHackingSkill < ns.getHackingLevel();
    let openPortsEnough: boolean = server.numOpenPortsRequired != undefined && 
        server.openPortCount != undefined &&
        server.openPortCount < server.numOpenPortsRequired;

    return hackingLevelHighEnough && openPortsEnough;
}

function openPorts(ns: NS, server: Server) {
    let hostname = server.hostname
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(hostname);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(hostname);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(hostname);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(hostname);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(hostname);
    }
}

function remoteNuke(ns: NS, server: Server): boolean {
    openPorts(ns, server);
    // Get root access to target server
    return ns.nuke(server.hostname)
}



function propagate(ns: NS, hosts: string[]): string[] {
    ns.tprint(`======= START ========`)
    ns.tprint(`hostList Received: ${hosts}`);
    let host = hosts.pop();
    if (host == undefined || host == 'home') {
        return []
    }
    const drainScript = "drain.js";
   
    ns.tprint(`Propagating to ${host}`);
    let nuked = remoteNuke(ns, ns.getServer(host));
    if (!nuked) {
        ns.tprint(`Not able to nuke ${host}. Stopping now`)
        return []
    }
    let copied = ns.scp(drainScript, host, "home");
    if (!copied) {
        ns.tprint(`Copying drain.ts failed on ${host}. ${ns.ls(host)} Stopping now.`);
        return []
    }

    let ramCost = ns.getScriptRam(drainScript, host);
    if (ramCost == 0) {
        ns.tprint(`Unable to calculate cost for RAM of the script on ${host}. Stopping now.`)
        return [];
    }
    let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host) 
    let threadNumber = Math.floor(availableRam / ramCost);
    ns.tprint(`Ram Cost: ${ramCost}, Available Ram: ${availableRam}, threadNumber: ${threadNumber}`);
    if (threadNumber >= 1) {
        ns.exec(drainScript, host, threadNumber);
    }

    let remoteServerAccessibleHosts = ns.scan(host);
    remoteServerAccessibleHosts.shift();
    return propagate(ns, hosts).concat(propagate(ns, remoteServerAccessibleHosts));
}

export async function main(ns: NS): Promise<void> {
    let hosts: string[] = ns.scan();
    propagate(ns, hosts);
}