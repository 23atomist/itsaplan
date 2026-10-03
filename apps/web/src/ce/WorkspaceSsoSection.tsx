// The workspace's single sign-on provider. A self-hosted instance signs in through the
// instance provider set in god mode, so the section is not rendered; the hosted build
// resolves `@/cloud` to its own implementation.
export default function WorkspaceSsoSection(_props: { workspaceId: number }) {
  return null;
}
