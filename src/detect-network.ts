import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  let hosts: Array<string> = ns.scan();
  for (let host of hosts) {

    let server = ns.getServer(host);
    ns.tprint(`HOSTS: ${server.hostname} - Hacked? ${server.backdoorInstalled} - Hack Difficult: ${server.hackDifficulty}`);
    if ( server.hackDifficulty && !server.backdoorInstalled && server.hackDifficulty < ns.getHackingLevel() ) {
      if (server.numOpenPortsRequired && server.numOpenPortsRequired > 0) {
        await ns.brutessh(server.hostname);
      }
      await ns.nuke(server.hostname);
      await ns.hack(server.hostname);

    }
  }
}

