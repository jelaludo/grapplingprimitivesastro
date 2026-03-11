// Rehype plugin: converts leftover Obsidian ![[image.png]] embeds in HTML to <img> tags.
// Images are served from /base/images/articles/

export default function rehypeObsidianImages() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      // Check for Obsidian embed pattern in text nodes
      if (node.value && node.value.includes('![[')) {
        node.type = 'raw';
        node.value = node.value.replace(
          /!\[\[(.+?\.(png|jpg|jpeg|gif|webp))\]\]/gi,
          (_, filename) =>
            `<img src="/images/articles/${filename}" alt="${filename}" />`
        );
      }
    });
  };
}

function visit(tree, type, fn) {
  if (tree.type === type) fn(tree);
  if (tree.children) {
    for (const child of tree.children) {
      visit(child, type, fn);
    }
  }
}
