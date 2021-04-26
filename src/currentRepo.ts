import { execFileSync } from 'child_process';
import { workspace, window } from 'vscode';

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

	return remoteURL;
};

export const getCurrentRepo = () => {
	// const repo = atom.project.getRepositories()[0];
	const url: string = getRemoteURL(getCurrentDirectory()); //repo.getOriginURL();
	let parts = url.split('/');
	parts[parts.length - 1] = parts[parts.length - 1]
		.split('')
		.filter((_: string, index: number) => {
			return index < parts[parts.length - 1].length - 4;
		})
		.join('');
	const [owner, name] = parts.filter((_, index) => {
		return parts.length - index <= 2;
	});
	return {
		owner,
		name,
	};
};
