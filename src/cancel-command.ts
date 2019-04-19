import {
    commands,
    window,
    QuickPickItem
} from "vscode";
import { isUndefined } from "util";

export async function stopTask() {
    commands.getCommands()
        .then(selectTask)
        .then(requestTaskTermination)
}

class StopRequest implements QuickPickItem {
    label: string;
    command: string;
    detail: string;
    date: string;

    static prefix = "metals.task.cancel-";

    constructor(cmd: string) {
        this.command = cmd;

        const segments = cmd.split("-");

        this.label = segments[1];
        this.date = segments[2];

        this.detail = "started at " + this.date
    }

    /**
     * newest first
     */
    compareTo(that: StopRequest): number {
        if (this.date > that.date) {
            return -1;
        }

        if (this.date < that.date) {
            return 1;
        }

        return 0;
    }
}

function selectTask(commands: string[]) {
    const stopRequests = commands
        .filter(name => name.startsWith(StopRequest.prefix))
        .map(cmd => new StopRequest(cmd))
        .sort((r1, r2) => r1.compareTo(r2));

    return window.showQuickPick(stopRequests);
}

function requestTaskTermination(request: StopRequest | undefined) {
    if (!isUndefined(request)) {
        commands.executeCommand(request.command).then(ignored => {
            window.showInformationMessage(request.label + ` cancelled`)
        })
    }
}