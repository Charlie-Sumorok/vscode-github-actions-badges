import { window, workspace } from 'vscode';

import { execFileSync } from 'child_process';

export const getCurrentDirectory = () => {
	if (workspace.workspaceFolders) {
		const rootFolder = workspace.workspaceFolders[0].uri.path;
		return rootFolder;
	} else {
		window.showInformationMessage('Please open a folder');
		return '';
	}
};

export const getRemoteURL = (directory: string) => {
	const remotesString = execFileSync('git', ['remote', '--verbose'], {
		encoding: 'utf-8',
		cwd: directory,
	});
	const remoteLines = remotesString.split('\n').filter(Boolean);
	const remotesInfo = remoteLines.map((remoteLine) => {
		const [remote, url, type] = remoteLine.split('\t').join(' ').split(' ');
		return {
			remote,
			url,
			type,
		};
	});
	const remoteURL = remotesInfo[0].url;

	const folders = directory.split('/');
	return [remoteURL, folders[folders.length - 1]];
};

export const getCurrentRepo = () => {
	const currentDirectory = getCurrentDirectory();
	const url = getRemoteURL(currentDirectory);
	let parts = url[0].split('/');
	parts[parts.length - 1] = parts[parts.length - 1]
		.split('')
		.filter((_: string, index: number) => {
			return index < parts[parts.length - 1].length - 4;
		})
		.join('');
	const [owner] = parts.filter((_, index) => {
		return parts.length - index <= 2;
	});
	const name = url[1];
	return {
		owner,
		name,
	};
};
