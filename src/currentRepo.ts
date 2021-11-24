import { execFileSync } from 'child_process';

import { window, workspace } from 'vscode';

export const getCurrentDirectory = () => {
	if (workspace.workspaceFolders) {
		const rootFolder = workspace.workspaceFolders[0].uri.path;
		return rootFolder;
	} else {
		window.showInformationMessage('Please open a folder');
		return '';
	}
};

export const getRemoteURL = async (directory: string) => {
	const remotesString = execFileSync('git', ['remote', '--verbose'], {
		encoding: 'utf-8',
		cwd: directory,
	});
	const remoteLines = remotesString.split('\n').filter(Boolean);
	const remotesInfo = await Promise.all(
		remoteLines.map(async (remoteLine) => {
			const [remote, url, type] = remoteLine
				.split('\t')
				.join(' ')
				.split(' ');
			return {
				remote,
				url,
				type,
			};
		})
	);
	const remoteURL = remotesInfo[0].url;

	const folderParts = directory.split('/');
	return {
		url: remoteURL,
		name: folderParts[folderParts.length - 1],
	};
};

export const getCurrentRepo = async () => {
	const currentDirectory = getCurrentDirectory();
	const { url, name } = await getRemoteURL(currentDirectory);
	const owner = url
		.split('')
		.filter((_: string, index: number) => {
			return index < url[0].length - 4;
		})
		.join('');
	return {
		owner,
		name,
	};
};
