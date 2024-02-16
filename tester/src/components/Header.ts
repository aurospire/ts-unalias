import { formatDate } from '@utils/formatDate';

export const Header = () => `<header>${formatDate(new Date())}</header>`;