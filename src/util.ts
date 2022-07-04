export function normalize(name: string = '') {
	return new URL(name, 'http://localhost').pathname.slice(1);
}
