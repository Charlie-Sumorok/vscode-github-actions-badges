import {
	TextDocument,
	Uri,
	WebviewView,
	WebviewViewProvider,
	window,
} from 'vscode';
import { getBadges, getWebviewContent } from './badges';

import { getCurrentRepo } from './currentRepo';

export class SidebarProvider implements WebviewViewProvider {
	_view?: WebviewView;
	_doc?: TextDocument;

	constructor(private readonly _extensionUri: Uri) {}

	public async resolveWebviewView(webviewView: WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = await this._getHtmlForWebview();

		webviewView.webview.onDidReceiveMessage((data) => {
			switch (data.type) {
				case 'onInfo': {
					if (!data.value) {
						return;
					}
					window.showInformationMessage(data.value);
					break;
				}
				case 'onError': {
					if (!data.value) {
						return;
					}
					window.showErrorMessage(data.value);
					break;
				}
			}
		});
	}

	private async _getHtmlForWebview() {
		return await getWebviewContent(await getBadges(getCurrentRepo()));
	}
}
