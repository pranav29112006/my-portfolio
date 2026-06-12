const menuIcon = document.getElementById("menu-icon");
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll("nav a");

menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

// Base prefix that is always present (never animated away)
const BASE_PREFIX = "I'm a ";

const roles = [
  {
    extra: "",
    title: "Game Developer",
    description:
      "Game Developer passionate about creating immersive worlds, engaging gameplay, and unforgettable player experiences through creativity and code.",
  },
  {
    extra: "",
    title: "Script Writer",
    description:
      "Script Writer bringing ideas to life through meaningful stories, powerful dialogues, and emotionally engaging narratives.",
  },
  {
    // NEW: Added 3D Modeler
    extra: "",
    title: "3D Modeler",
    description:
      "3D Modeler crafting detailed and optimized 3D assets, characters, and environments for immersive visual experiences.",
  },
  {
    extra: "",
    title: "Web Developer",
    description:
      "Web Developer dedicated to building modern, responsive, and user-friendly websites that combine creativity with functionality.",
  },
  {
    extra: "going to become a ",
    title: "Software Engineer",
    description:
      "Aspiring Software Engineer constantly learning, improving, and working towards building innovative solutions that make a real impact.",
  },
];

const TYPE_DURATION      = 3400;
const DELETE_DURATION    = 2600;
const PREFIX_TYPE_DUR    = 1200; // duration to type/delete the extra prefix part
const PAUSE_AFTER_COMPLETE = 2800;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animate title + description together (type or delete)
function animateTextTogether(titleEl, title, descEl, desc, duration, deleting = false) {
  return new Promise((resolve) => {
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const linearProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(linearProgress);
      const progress = deleting ? 1 - easedProgress : easedProgress;

      titleEl.textContent = title.slice(0, Math.round(progress * title.length));
      descEl.textContent  = desc.slice(0,  Math.round(progress * desc.length));

      if (linearProgress < 1) {
        requestAnimationFrame(frame);
      } else {
        titleEl.textContent = deleting ? "" : title;
        descEl.textContent  = deleting ? "" : desc;
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

// Animate the prefix element between two strings (used for the extra prefix part)
// fromText → toText over `duration` ms
function animatePrefix(prefixEl, fromText, toText, duration) {
  return new Promise((resolve) => {
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const linearProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(linearProgress);

      // We're either growing or shrinking the string
      const growing = toText.length >= fromText.length;

      if (growing) {
        // Type: reveal toText progressively
        const len = Math.round(easedProgress * toText.length);
        // Keep at least fromText.length visible while growing
        prefixEl.textContent = toText.slice(0, Math.max(fromText.length, len));
      } else {
        // Delete: shrink fromText down to toText length
        const charsToRemove = fromText.length - toText.length;
        const removed = Math.round(easedProgress * charsToRemove);
        prefixEl.textContent = fromText.slice(0, fromText.length - removed);
      }

      if (linearProgress < 1) {
        requestAnimationFrame(frame);
      } else {
        prefixEl.textContent = toText;
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTypewriter() {
  const prefixEl = document.getElementById("typing-prefix");
  const roleEl   = document.getElementById("typing-role");
  const descEl   = document.getElementById("typing-description");

  let index = 0;

  // Always start with the base prefix visible; cursor only on roleEl
  prefixEl.textContent = BASE_PREFIX;
  roleEl.textContent   = "";
  descEl.textContent   = "";

  while (true) {
    const role = roles[index];

    // --- STEP 1: If this role has an extra prefix, animate it in ---
    // e.g. "I'm a " → "I'm going to become a "
    if (role.extra) {
      const fullPrefix = "I'm " + role.extra;
      await animatePrefix(prefixEl, BASE_PREFIX, fullPrefix, PREFIX_TYPE_DUR);
    } else {
      prefixEl.textContent = BASE_PREFIX;
    }

    // --- STEP 2: Type the title + description ---
    roleEl.textContent = "";
    descEl.textContent = "";

    await animateTextTogether(
      roleEl, role.title,
      descEl, role.description,
      TYPE_DURATION, false
    );

    await sleep(PAUSE_AFTER_COMPLETE);

    // --- STEP 3: Delete the title + description ---
    await animateTextTogether(
      roleEl, role.title,
      descEl, role.description,
      DELETE_DURATION, true
    );

    // --- STEP 4: If this role had an extra prefix, animate it back out ---
    // e.g. "I'm going to become a " → "I'm a "
    if (role.extra) {
      const fullPrefix = "I'm " + role.extra;
      await animatePrefix(prefixEl, fullPrefix, BASE_PREFIX, PREFIX_TYPE_DUR);
    }

    index = (index + 1) % roles.length;
  }
}

runTypewriter();