// Mapping from a remote ava-architects.vn asset URL to its place under assets/.

/** Remote upload/theme URL -> local path under assets/. */
export function localPath(url) {
  const u = new URL(url);
  if (u.pathname.startsWith('/wp-content/uploads/')) {
    return 'assets/img/' + u.pathname.replace('/wp-content/uploads/', '');
  }
  if (u.pathname.includes('/themes/lw_customize/fonts/')) {
    return 'assets/fonts/' + u.pathname.split('/').pop();
  }
  if (u.pathname.includes('/wp-content/fonts/')) {
    return 'assets/fonts/' + u.pathname.replace('/wp-content/fonts/', '');
  }
  if (u.pathname.includes('/flatsome/assets/css/icons/')) {
    return 'assets/fonts/' + u.pathname.split('/').pop();
  }
  return 'assets/misc/' + u.pathname.split('/').pop();
}
