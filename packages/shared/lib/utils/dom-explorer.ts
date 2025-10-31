/**
 * Helper to explore DOM structure - for development/debugging
 */
export const exploreDOMFromInput = () => {
  const chatInput = document.querySelector('[data-testid="chat-input"]');
  if (!chatInput) {
    console.log('❌ Chat input not found');
    return;
  }

  console.log('✅ Chat input found:', chatInput);

  // Traverse up to find element with sticky class
  let current = chatInput.parentElement;
  let depth = 0;

  while (current && depth < 20) {
    depth++;
    const classes = Array.from(current.classList);
    console.log(`↑ Level ${depth}:`, {
      tag: current.tagName,
      classes: classes,
      hasSticky: classes.some(c => c.includes('sticky')),
    });

    if (classes.some(c => c.includes('sticky'))) {
      console.log('🎯 Found element with sticky class!');
      console.log('Parent:', current.parentElement);
      console.log('Siblings:', Array.from(current.parentElement?.children || []));

      // Look for siblings
      const siblings = Array.from(current.parentElement?.children || []).filter(el => el !== current);

      console.log('📋 Sibling details:');
      siblings.forEach((sibling, idx) => {
        console.log(`  Sibling ${idx}:`, {
          tag: sibling.tagName,
          classes: Array.from(sibling.classList),
          hasChildren: sibling.children.length,
        });
      });

      break;
    }

    current = current.parentElement;
  }
};
