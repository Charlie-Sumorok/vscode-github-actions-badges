import { ExtensionContext, commands, window, Disposable } from 'vscode';

import { showBadgePanel } from './badges';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "github-actions-badges" is now active!'
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const extensionCommands = [
		commands.registerCommand('github-actions-badges.open-workflow', () => {
			// The code you place here will be executed every time your command is executed

			// Display a message box to the user
			window.showInformationMessage('Opening workflows on GitHub.com');
		}),

		commands.registerCommand('github-actions-badges.show-badges', () => {
			window.showInformationMessage('Showing Badges');
			showBadgePanel();
		}),
	];

	extensionCommands.forEach((extensionCommand: Disposable) => {
		context.subscriptions.push(extensionCommand);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
