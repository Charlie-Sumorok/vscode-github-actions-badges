import {
	Disposable,
	ExtensionContext,
	ProgressLocation,
	Uri,
	commands,
	env,
	window,
} from 'vscode';

import { getBadges } from './badges';
import { getCurrentRepo } from './currentRepo';
import { SidebarProvider } from './sidebar';

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
		window.registerWebviewViewProvider(
			'vscode-github-actions-badges-sidebar',
			new SidebarProvider(context.extensionUri)
		),

		commands.registerCommand(
			'vscode-github-actions-badges.show-badges-preview',
			async () => {
				const { owner, name } = await getCurrentRepo();
				window.withProgress(
					{
						location: ProgressLocation.Notification,
						title: `Showing Badges for ${owner}/${name}`,
						cancellable: true,
					},
					() => {
						return new Promise<void>((resolve) => {
							setTimeout(async () => {
								await commands.executeCommand(
									'vscode-github-actions-badges-sidebar.focus'
								);
								resolve();
							}, 0);
						});
					}
				);
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.close-badges-preview',
			async () => {
				const { owner, name } = await getCurrentRepo();
				window.withProgress(
					{
						location: ProgressLocation.Notification,
						title: `Closing Badges for ${owner}/${name}`,
						cancellable: true,
					},
					() => {
						return new Promise<void>((resolve) => {
							setTimeout(async () => {
								await commands.executeCommand(
									'workbench.action.closeSidebar'
								);
								resolve();
							}, 0);
						});
					}
				);
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.reload-badges-preview',
			async () => {
				const { owner, name } = await getCurrentRepo();
				window.withProgress(
					{
						location: ProgressLocation.Notification,
						title: `Reloading Badges for ${owner}/${name}`,
						cancellable: true,
					},
					() => {
						return new Promise<void>((resolve) => {
							setTimeout(async () => {
								const sidebarCommands = [
									'vscode-github-actions-badges.close-badges-preview',
									'vscode-github-actions-badges.show-badges-preview',
								];
								await Promise.all(
									sidebarCommands.map(
										(sidebarCommand: string) => {
											return commands.executeCommand(
												sidebarCommand
											);
										}
									)
								);
								resolve();
							}, 0);
						});
					}
				);
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.open-workflow',
			async () => {
				const currentRepo = await getCurrentRepo();
				const badges = await getBadges(currentRepo);
				const quickPickBadges = badges.map(({ workflow, name }) => {
					return {
						label: name,
						url: Uri.parse(workflow),
					};
				});
				const chosenWorkflow = await window.showQuickPick(
					quickPickBadges
				);
				if (chosenWorkflow) {
					window.withProgress(
						{
							location: ProgressLocation.Notification,
							title: `Opening workflow '${chosenWorkflow.label}' on GitHub.com`,
							cancellable: true,
						},
						() => {
							return new Promise<void>((resolve) => {
								setTimeout(async () => {
									env.openExternal(chosenWorkflow.url);
									resolve();
								}, 0);
							});
						}
					);
				}
			}
		),
		commands.registerCommand(
			'vscode-github-actions-badges.open-workflows',
			async () => {
				const { owner, name } = await getCurrentRepo();
				const url = Uri.parse(
					`https://github.com/${owner}/${name}/actions`
				);
				window.withProgress(
					{
						location: ProgressLocation.Notification,
						title: 'Opening all workflows on GitHub.com',
						cancellable: true,
					},
					() => {
						return new Promise<void>((resolve) => {
							setTimeout(async () => {
								env.openExternal(url);
								resolve();
							}, 0);
						});
					}
				);
			}
		),
	];

	extensionCommands.forEach((extensionCommand: Disposable) => {
		context.subscriptions.push(extensionCommand);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
