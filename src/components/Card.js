export function Card(content = "") {
  const element = document.createElement("section");
  element.className = "gs-card";
  element.textContent = content;
  return element;
}
