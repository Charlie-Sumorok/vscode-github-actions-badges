import { execFileSync } from 'child_process';

import { window, workspace } from 'vscode';

import { Repo } from './badges';

export const getCurrentDirectory = () => {
	if (workspace.workspaceFolders) {
		const rootFolder = workspace.workspaceFolders[0].uri.path;
		return rootFolder;
	} else {
		window.showInformationMessage('Please open a folder');
		return '';
	}
};

export const getRepoInDirectory = async (directory: string) => {
	const remotesString = execFileSync('git', ['remote', '--verbose'], {
		encoding: 'utf-8',
		cwd: directory,
	});

	const remotesInfo = await Promise.all(
		remotesString
			.split('\n')
			.filter(Boolean)
			.map(async (remoteLine) => {
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

export const getCurrentRepo: () => Promise<Repo> = async () => {
	const currentDirectory = getCurrentDirectory();
	const { url, name } = await getRepoInDirectory(currentDirectory);
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
