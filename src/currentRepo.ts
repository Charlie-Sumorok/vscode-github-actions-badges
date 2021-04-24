export const getRemoteURL = () => {
	return 'https://github.com/Charlie-Sumorok/Linux-Distro-Picker.git';
};

export const getCurrentRepo = () => {
	// const repo = atom.project.getRepositories()[0];
	const url: string = getRemoteURL(); //repo.getOriginURL();
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
