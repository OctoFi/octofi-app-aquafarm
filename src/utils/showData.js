export const showData = (data, placeholder = '-') => {
	try {
		return data || placeholder;
	} catch (e) {
		return placeholder;
	}
}