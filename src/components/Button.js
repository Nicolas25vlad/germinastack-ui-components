export function Button({ label = "Botão", variant = "primary", type = "button" } = {}) {
  const element = document.createElement("button");
  element.className = `gs-btn gs-btn-${variant}`;
  element.type = type;
  element.textContent = label;
  return element;
}
