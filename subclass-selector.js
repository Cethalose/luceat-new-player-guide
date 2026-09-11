"use strict";

const subclassIdsByClass = {
  artificer: ["field-alchemist","warding-smith","clockwork-sapper","steelbound-companion-smith"],
  barbarian: ["path-of-the-berserker","totem-kin-path"],
  bard: ["college-of-lore","college-of-battle-hymns"],
  cleric: ["lantern-archive-domain","life-domain","dawn-vigil-domain-ember-mercy-domain","green-mantle-domain","storm-bell-domain","mirrored-road-domain","war-banner-domain"],
  druid: ["circle-of-the-land","circle-of-moonlit-forms"],
  fighter: ["champion","tactical-dice-captain","arcane-weapon-adept"],
  monk: ["way-of-the-open-hand","way-of-the-veiled-step","way-of-the-still-flame"],
  paladin: ["oath-of-devotion","oath-of-the-star-watch","oath-of-the-open-road"],
  ranger: ["hunter","beast-bond-warden"],
  rogue: ["thief","knife-dance-agent","spellhand-trickster"],
  sorcerer: ["draconic-bloodline","wild-spark-bloodline"],
  warlock: ["mirror-veil-patron","the-fiend","deep-current-patron"],
  wizard: ["school-of-warding","school-of-binding-lines","school-of-open-omens","school-of-silver-tongues","school-of-evocation","school-of-shifting-veils","school-of-quiet-graves","school-of-translation"]
};

const corpus = document.querySelector(".progression-corpus");
const className = corpus && corpus.dataset.class;
const subclassIds = subclassIdsByClass[className] || [];
const headings = subclassIds.map(id => document.getElementById(id)).filter(Boolean);

if (corpus && headings.length === subclassIds.length) {
  const firstSubclass = headings[0];

  const moveBaseSection = id => {
    const heading = document.getElementById(id);
    if (!heading) return;
    const nodes = [heading];
    for (let node = heading.nextElementSibling; node && !/^H[1-3]$/.test(node.tagName); node = node.nextElementSibling) nodes.push(node);
    for (const node of nodes) corpus.insertBefore(node, firstSubclass);
  };
  moveBaseSection("how-" + className + "-spellcasting-works");
  moveBaseSection(className + "-fighting-styles");

  const selector = document.createElement("section");
  selector.className = "subclass-selector";
  const title = document.createElement("h2");
  title.id = "subclass-selection-heading";
  title.textContent = className[0].toUpperCase() + className.slice(1) + " subclass selection";
  selector.setAttribute("aria-labelledby", title.id);
  selector.append(title);

  const help = document.createElement("p");
  help.textContent = "Choose a subclass to view its complete mechanically meaningful progression. Switch choices here without scrolling through the other subclasses.";
  selector.append(help);

  const tablist = document.createElement("div");
  tablist.className = "subclass-tabs";
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-label", title.textContent);
  selector.append(tablist);

  const panels = document.createElement("div");
  panels.className = "subclass-panels";
  selector.append(panels);
  corpus.insertBefore(selector, firstSubclass);

  const tabs = [];
  const panelById = new Map();
  for (const [index, heading] of headings.entries()) {
    const nextHeading = headings[index + 1];
    const panel = document.createElement("section");
    panel.className = "subclass-panel";
    panel.id = "panel-" + heading.id;
    panel.setAttribute("role", "tabpanel");
    panel.hidden = index !== 0;
    let node = heading;
    while (node && node !== nextHeading) {
      const next = node.nextElementSibling;
      panel.append(node);
      node = next;
    }
    panels.append(panel);
    panelById.set(heading.id, panel);

    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = "tab-" + heading.id;
    tab.textContent = heading.textContent;
    tab.dataset.subclassTarget = heading.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    tab.setAttribute("aria-selected", String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    panel.setAttribute("aria-labelledby", tab.id);
    tablist.append(tab);
    tabs.push(tab);
  }

  const attachCasting = (headingId, panelId) => {
    const heading = document.getElementById(headingId);
    const panel = panelById.get(panelId);
    if (!heading || !panel) return;
    let node = heading;
    while (node) {
      const next = node.nextElementSibling;
      panel.append(node);
      node = next;
    }
  };
  attachCasting("arcane-weapon-adept-spellcasting-progression", "arcane-weapon-adept");
  attachCasting("spellhand-trickster-spellcasting-progression", "spellhand-trickster");

  const select = (tab, updateHash) => {
    for (const candidate of tabs) {
      const active = candidate === tab;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
      document.getElementById(candidate.getAttribute("aria-controls")).hidden = !active;
    }
    if (updateHash) history.replaceState(null, "", "#" + tab.dataset.subclassTarget);
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => select(tab, true));
    tab.addEventListener("keydown", event => {
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      select(next, true);
      next.focus();
    });
  }

  const addressed = location.hash.slice(1);
  const addressedTab = tabs.find(tab => tab.dataset.subclassTarget === addressed);
  if (addressedTab) select(addressedTab, false);
}
