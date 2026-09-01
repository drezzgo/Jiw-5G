const REPOSITORY_BASE = "https://github.com/drezzgo/Jiw-5G/blob/main/";

export function githubFileUrl(path: string): string {
  return `${REPOSITORY_BASE}${path}`;
}
