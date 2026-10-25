import AppKit
import Foundation

struct HostPaths: Decodable {
    let nodePath: String
    let repositoryPath: String
    let ownerRepositoryPath: String
    let catalogPath: String
}

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}

guard let resourceURL = Bundle.main.resourceURL else { fail("Missing owner host resources.") }
let paths: HostPaths
do {
    paths = try JSONDecoder().decode(HostPaths.self, from: Data(contentsOf: resourceURL.appendingPathComponent("owner-host.json")))
} catch { fail("Cannot read owner host paths: \(error.localizedDescription)") }
guard [paths.nodePath, paths.repositoryPath, paths.ownerRepositoryPath, paths.catalogPath].allSatisfy({ $0.hasPrefix("/") }) else {
    fail("Owner host paths must be absolute.")
}

let requestAccess = CommandLine.arguments.contains("--request-access")
if requestAccess {
    let app = NSApplication.shared
    app.setActivationPolicy(.regular)
    app.finishLaunching()
    app.activate(ignoringOtherApps: true)
    let explanation = NSAlert()
    explanation.messageText = "Allow Site Health to read your Fleet files"
    explanation.informativeText = "Site Health needs Desktop folder access to read the canonical portfolio catalog and local evidence. Click Continue, then allow macOS Desktop access for Site Health. No service is started by this action."
    explanation.addButton(withTitle: "Continue")
    explanation.addButton(withTitle: "Cancel")
    guard explanation.runModal() == .alertFirstButtonReturn else { exit(2) }
}

do {
    let catalog = try FileHandle(forReadingFrom: URL(fileURLWithPath: paths.catalogPath))
    defer { try? catalog.close() }
    guard try catalog.read(upToCount: 1)?.isEmpty == false else { fail("The canonical catalog is empty.") }
} catch {
    if requestAccess {
        let alert = NSAlert()
        alert.messageText = "Site Health could not read the catalog"
        alert.informativeText = "Allow Site Health in System Settings → Privacy & Security → Files and Folders, then retry. \(error.localizedDescription)"
        alert.runModal()
    }
    fail("Site Health cannot read its canonical catalog: \(error.localizedDescription)")
}
if requestAccess {
    print("Site Health catalog access confirmed.")
    exit(0)
}

let child = Process()
child.executableURL = URL(fileURLWithPath: paths.nodePath)
child.arguments = [paths.repositoryPath + "/scripts/start-owner.mjs"]
child.currentDirectoryURL = URL(fileURLWithPath: paths.repositoryPath)
var environment = ProcessInfo.processInfo.environment
environment["PATH"] = URL(fileURLWithPath: paths.nodePath).deletingLastPathComponent().path + ":/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
environment["SITE_HEALTH_OWNER_REPOSITORY"] = paths.ownerRepositoryPath
environment["SITE_HEALTH_CATALOG_PATH"] = paths.catalogPath
environment["SITE_HEALTH_OWNER_HOST"] = "1"
child.environment = environment
child.standardOutput = FileHandle.standardOutput
child.standardError = FileHandle.standardError
var signals: [DispatchSourceSignal] = []
for value in [SIGTERM, SIGINT] {
    signal(value, SIG_IGN)
    let source = DispatchSource.makeSignalSource(signal: value, queue: .main)
    source.setEventHandler { if child.isRunning { child.terminate() } }
    source.resume()
    signals.append(source)
}
child.terminationHandler = { process in
    exit(process.terminationReason == .exit ? process.terminationStatus : 1)
}
do { try child.run() } catch { fail("Cannot start Site Health: \(error.localizedDescription)") }
RunLoop.main.run()
