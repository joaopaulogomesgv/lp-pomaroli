/* Pomaroli — interactions */

(() => {
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const mobile = document.querySelector(".nav__mobile");
  const hero = document.querySelector(".hero");
  const mockup = document.querySelector(".demo__app");
  const navCta = document.querySelector(".nav__cta-scroll");

  if (navCta) navCta.hidden = false;

  // Nav vira pílula flutuante ao rolar + mockup endireita + CTA do header
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (mockup && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mockup.classList.toggle("is-flat", y > 40);
    }
    if (navCta && hero) {
      navCta.classList.toggle(
        "is-on",
        hero.getBoundingClientRect().bottom < (nav.offsetHeight || 64)
      );
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  if (burger && mobile) {
    const toggle = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      mobile.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };

    burger.addEventListener("click", () =>
      toggle(burger.getAttribute("aria-expanded") !== "true")
    );

    mobile.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => toggle(false))
    );

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) toggle(false);
    });
  }

  // FAQ — abre só um por vez
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  // Scroll reveal
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ============================================
     Mockup "Sua marca" — troca manual + auto-rotação
     ============================================ */
  const phone = document.querySelector(".brandcard__phone");
  const nameEl = document.getElementById("brandName");
  const logoEl = document.getElementById("brandLogo");
  const dots = document.querySelectorAll(".brand-dot");
  let brandTimer = null;

  const applyBrand = (dot) => {
    dots.forEach((d) => d.classList.remove("is-active"));
    dot.classList.add("is-active");
    const color = getComputedStyle(dot).getPropertyValue("--c").trim();
    phone.style.setProperty("--brand", color);
    nameEl.textContent = dot.dataset.name;
    logoEl.textContent = dot.dataset.letter;
  };

  if (phone && nameEl && logoEl && dots.length) {
    let brandIndex = 0;

    const nextBrand = () => {
      brandIndex = (brandIndex + 1) % dots.length;
      applyBrand(dots[brandIndex]);
    };

    const restartBrandTimer = () => {
      clearInterval(brandTimer);
      brandTimer = setInterval(nextBrand, 5000);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        brandIndex = i;
        applyBrand(dot);
        restartBrandTimer();
      });
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      restartBrandTimer();
    }
  }

  /* Spotlight nos cards — só ponteiro fino, sem reduced-motion */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const noReduce = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (finePointer && noReduce) {
    document.querySelectorAll(".feature, .quote, .plan, .postcard").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    /* spotlight global de 600px no fundo */
    document.addEventListener(
      "pointermove",
      (e) => {
        const root = document.documentElement;
        root.style.setProperty("--mx", `${e.clientX - 300}px`);
        root.style.setProperty("--my", `${e.clientY - 300}px`);
      },
      { passive: true }
    );

    /* magnético: botão primário segue o cursor até 8px (não se aplica ao CTA do header) */
    document.querySelectorAll(".btn--lime:not(.nav__cta-scroll)").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 16;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 16;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener("pointerdown", () => {
        btn.style.transform += " scale(0.97)";
      });
      btn.addEventListener("pointerup", () => {
        btn.style.transform = "";
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transition = "transform 300ms cubic-bezier(.2,.8,.2,1)";
        btn.style.transform = "";
        window.setTimeout(() => {
          btn.style.transition = "";
        }, 320);
      });
    });
  }

  /* ripple suave no clique (qualquer ponteiro, sem reduced-motion) */
  if (noReduce) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        const r = btn.getBoundingClientRect();
        const sp = document.createElement("span");
        sp.className = "btn__ripple";
        sp.style.left = `${e.clientX - r.left}px`;
        sp.style.top = `${e.clientY - r.top}px`;
        btn.appendChild(sp);
        window.setTimeout(() => sp.remove(), 620);
      });
    });
  }

  /* Revealer de títulos: quebra em palavras/linhas e anima com stagger de 80ms */
  if (noReduce) {
    const splitTitle = (el) => {
      if (el.dataset.split) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (/\S/.test(n.nodeValue)) nodes.push(n);
      }
      nodes.forEach((node) => {
        const frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const outer = document.createElement("span");
            outer.className = "w";
            const inner = document.createElement("i");
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
        });
        node.parentNode.replaceChild(frag, node);
      });
      const words = [...el.querySelectorAll(".w")];
      if (!words.length) return;
      const rows = [];
      words.forEach((w) => {
        const top = Math.round(w.getBoundingClientRect().top);
        const last = rows[rows.length - 1];
        if (last && Math.abs(last.top - top) < 6) {
          last.words.push(w);
        } else {
          rows.push({ top, words: [w] });
        }
      });
      rows.forEach((row, i) => {
        row.words.forEach((w) => {
          w.querySelector("i").style.setProperty("--d", `${i * 80}ms`);
        });
      });
      el.dataset.split = "1";
    };

    const titles = [...document.querySelectorAll(".section__title, .finalcta__title")];
    const checkTitles = () => {
      const h = window.innerHeight;
      titles.forEach((t) => {
        if (t.classList.contains("is-in")) return;
        const r = t.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) t.classList.add("is-in");
      });
    };
    const startTitles = () => {
      titles.forEach(splitTitle);
      checkTitles();
      window.addEventListener("scroll", checkTitles, { passive: true });
      window.addEventListener("resize", checkTitles, { passive: true });
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([
      fontsReady,
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
    ]).then(startTitles);
  }

  /* Filtro de categorias do blog */
  const blogGrid = document.getElementById("blogGrid");
  const blogCats = document.querySelectorAll(".blog__cat");
  const blogEmpty = document.getElementById("blogEmpty");
  if (blogGrid && blogCats.length) {
    const cards = [...blogGrid.querySelectorAll(".postcard")];
    blogCats.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        blogCats.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", String(on));
        });
        let visible = 0;
        cards.forEach((card) => {
          const show = filter === "all" || card.dataset.cat === filter;
          card.classList.toggle("is-hidden", !show);
          if (show) visible++;
        });
        if (blogEmpty) blogEmpty.hidden = visible > 0;
      });
    });
  }

  /* ============================================
     Formulário de lead — WhatsApp
     ============================================ */
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    const leadErr = document.getElementById("leadFormError");
    const leadOk = document.getElementById("leadFormOk");
    const leadWaLink = document.getElementById("leadFormWaLink");

    leadForm.querySelectorAll('input[name="whatsapp"]').forEach((inp) => {
      inp.addEventListener("input", () => {
        let d = inp.value.replace(/\D/g, "").slice(0, 11);
        if (d.length > 6) {
          inp.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        } else if (d.length > 2) {
          inp.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
        } else if (d.length) {
          inp.value = `(${d}`;
        }
      });
    });

    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      leadForm.querySelectorAll(".leadform__field").forEach((f) => f.classList.remove("is-err"));

      const nome = leadForm.nome.value.trim();
      const email = leadForm.email.value.trim();
      const whats = leadForm.whatsapp.value.trim();
      const curso = leadForm.curso.value.trim();
      const alunos = leadForm.alunos.value;
      const waDigits = whats.replace(/\D/g, "");

      if (nome.length < 2) { leadForm.nome.closest(".leadform__field").classList.add("is-err"); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { leadForm.email.closest(".leadform__field").classList.add("is-err"); ok = false; }
      if (waDigits.length < 10) { leadForm.whatsapp.closest(".leadform__field").classList.add("is-err"); ok = false; }
      if (curso.length < 2) { leadForm.curso.closest(".leadform__field").classList.add("is-err"); ok = false; }

      if (leadErr) leadErr.hidden = ok;
      if (!ok) return;

      const wa = leadForm.dataset.wa || "5511999999999";
      const lines = [
        "Olá, Pomaroli! Quero testar a plataforma.",
        "",
        `Nome: ${nome}`,
        `Curso: ${curso}`,
        `E-mail: ${email}`,
        `WhatsApp: ${whats}`,
      ];
      if (alunos) lines.push(`Alunos hoje: ${alunos}`);
      const url = `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;

      if (leadWaLink) leadWaLink.href = url;
      window.open(url, "_blank", "noopener");
      if (leadOk) leadOk.hidden = false;
    });
  }

  /* ============================================
     Demo ao vivo — painel white-label
     ============================================ */
  const demoApp = document.getElementById("demoApp");
  if (!demoApp) return;

  const $ = (id) => document.getElementById(id);
  const demoPhone = $("demoPhone");
  const demoLogo = $("demoLogo");
  const demoBrand = $("demoBrand");
  const demoAvatar = $("demoAvatar");
  const demoUser = $("demoUser");
  const demoBody = $("demoBody");
  const demoOptions = $("demoOptions");
  const demoCursor = $("demoCursor");
  const demoFeedback = $("demoFeedback");
  const demoFeedbackIcon = $("demoFeedbackIcon");
  const demoFeedbackText = $("demoFeedbackText");
  const demoCommentText = $("demoCommentText");
  const statPub = $("statPub");
  const statSim = $("statSim");
  const statAcc = $("statAcc");

  const LETTERS = ["A", "B", "C", "D"];

  const BRANDS = [
    {
      name: "Aprova Total",
      letter: "A",
      color: "#7bc51f",
      stats: { pub: "1.248", sim: "12", acc: 78 },
      questions: [
        {
          tag: "Direito Administrativo",
          text: "A investidura em cargo público depende de:",
          alts: ["Concurso público", "Indicação política", "Diploma extra", "Experiência prévia"],
          correct: 0,
        },
        {
          tag: "Direito Constitucional",
          text: "O prazo decadencial do art. 54 da Lei 9.784/99 para anular ato é de:",
          alts: ["1 ano", "3 anos", "5 anos", "10 anos"],
          correct: 2,
        },
        {
          tag: "Ética Pública",
          text: "A moralidade administrativa exige da Administração:",
          alts: ["Probidade e boa-fé", "Celeridade absoluta", "Sigilo total", "Preço de mercado"],
          correct: 0,
        },
      ],
      answer: { card: 1, picked: 2, comment: "Gabarito: C — 5 anos (art. 54, Lei 9.784/99)." },
    },
    {
      name: "Direito Fácil",
      letter: "D",
      color: "#2563eb",
      stats: { pub: "3.410", sim: "28", acc: 84 },
      questions: [
        {
          tag: "Constitucional",
          text: "Princípios expressos do art. 37 — EXCETO:",
          alts: ["Impessoalidade", "Supremacia do interesse", "Publicidade", "Eficiência"],
          correct: 1,
        },
        {
          tag: "Administrativo",
          text: "Licitação na modalidade pregão é usada para:",
          alts: ["Obras de arte", "Comuns de menor valor", "Serviços de propaganda", "Perícia técnica"],
          correct: 1,
        },
        {
          tag: "Processual",
          text: "A petição inicial deve conter, entre outros, o:",
          alts: ["Nome do juiz", "Valor da causa", "CPF do advogado", "Nº do processo"],
          correct: 1,
        },
      ],
      answer: { card: 0, picked: 1, comment: "Gabarito: B — supremacia não é princípio expresso do art. 37." },
    },
    {
      name: "Alvo TRT",
      letter: "T",
      color: "#db2777",
      stats: { pub: "892", sim: "9", acc: 71 },
      questions: [
        {
          tag: "Língua Portuguesa",
          text: "Está conforme a norma-padrão:",
          alts: ["Fui eu quem assinou", "Cada um devem ir", "A mim me disseram", "Entre eu e ele fomos"],
          correct: 0,
        },
        {
          tag: "Raciocínio Lógico",
          text: "Se P → Q e Q é verdadeira, então:",
          alts: ["P é falsa", "P é verdadeira", "Nada se conclui", "P e Q são idênticas"],
          correct: 2,
        },
        {
          tag: "Direito do Trabalho",
          text: "A jornada máxima ordinária é de:",
          alts: ["6 horas diárias", "8 horas diárias", "10 horas diárias", "12 horas diárias"],
          correct: 1,
        },
      ],
      answer: { card: 0, picked: 1, comment: "Errou — gabarito: A. “Fui eu quem assinou” concorda em número." },
    },
    {
      name: "Bom Estudo",
      letter: "B",
      color: "#d97706",
      stats: { pub: "1.105", sim: "15", acc: 80 },
      questions: [
        {
          tag: "Informática",
          text: "Função do Excel que soma intervalos:",
          alts: ["CONT.SE", "SOMA", "SOMASE", "MÉDIA"],
          correct: 1,
        },
        {
          tag: "Windows",
          text: "Atalho do teclado para desfazer é:",
          alts: ["Ctrl+Z", "Ctrl+Y", "Ctrl+P", "Alt+F4"],
          correct: 0,
        },
        {
          tag: "Segurança",
          text: "A melhor prática de senha é:",
          alts: ["Usar data de nascimento", "Reutilizar em sites", "Frase longa única", "Senha de 4 dígitos"],
          correct: 2,
        },
      ],
      answer: { card: 1, picked: 0, comment: "Gabarito: A — Ctrl+Z desfaz a última ação." },
    },
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let timers = [];
  let playing = false;
  let current = 0;

  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  };

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const showIn = (el) => {
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
  };

  const setBrand = (b) => {
    demoPhone.style.setProperty("--demo-brand", b.color);
    demoLogo.textContent = b.letter;
    demoBrand.textContent = b.name;
    demoAvatar.textContent = b.letter;
    demoUser.textContent = b.name;
    statPub.textContent = b.stats.pub;
    statSim.textContent = b.stats.sim;
    statAcc.textContent = String(b.stats.acc);
  };

  const buildCards = (b) => {
    demoOptions.innerHTML = "";
    b.questions.forEach((q) => {
      const card = document.createElement("article");
      card.className = "demo__card";
      const alts = q.alts
        .map(
          (t, i) =>
            `<button type="button" class="demo__alt" data-i="${i}"><i>${LETTERS[i]}</i>${t}</button>`
        )
        .join("");
      card.innerHTML =
        `<div class="demo__card-top">` +
        `<span class="demo__card-tag">${q.tag}</span>` +
        `<span class="demo__card-badge">Publicada</span>` +
        `</div>` +
        `<p class="demo__card-q">${q.text}</p>` +
        `<div class="demo__alts">${alts}</div>`;
      demoOptions.appendChild(card);
    });
    return [...demoOptions.children];
  };

  const hideAnswerUI = () => {
    demoFeedback.hidden = true;
    demoFeedback.className = "demo__toast";
    demoCursor.className = "demo__cursor";
    demoBody.classList.remove("is-exiting");
  };

  const countAcc = (from, to) => {
    const steps = 14;
    let i = 0;
    const tick = () => {
      i += 1;
      const v = Math.round(from + ((to - from) * i) / steps);
      statAcc.textContent = String(v);
      if (i < steps) later(tick, 40);
    };
    later(tick, 40);
  };

  const showInCard = (card, picked, correct, ok, badgeText) => {
    const alts = [...card.querySelectorAll(".demo__alt")];
    alts.forEach((a) => a.classList.remove("is-hover"));
    card.classList.add("is-answered");
    card.querySelector(".demo__card-badge").textContent = badgeText;
    alts[picked].classList.add(ok ? "is-correct" : "is-wrong");
    if (!ok) alts[correct].classList.add("is-correct");
  };

  const renderStatic = (b, n) => {
    setBrand(b);
    hideAnswerUI();

    const stats = [...demoBody.querySelectorAll(".demo__stat")];
    stats.forEach((s) => s.classList.add("is-in"));

    const cards = buildCards(b);
    cards.forEach((c) => c.classList.add("is-in"));

    const { card, picked, correct, comment } = b.answer;
    const ok = picked === correct;
    showInCard(cards[card], picked, correct, ok, ok ? "Respondida · correta" : "Respondida · incorreta");

    demoFeedback.hidden = false;
    demoFeedback.className = `demo__toast is-in ${ok ? "is-ok" : "is-err"}`;
    demoFeedbackIcon.textContent = ok ? "✓" : "✕";
    demoFeedbackText.textContent = ok ? "Resposta correta" : "Resposta incorreta";
    demoCommentText.textContent = comment;
  };

  const moveCursorTo = (el, done) => {
    const bodyRect = demoBody.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const x = elRect.left - bodyRect.left + elRect.width * 0.7;
    const y = elRect.top - bodyRect.top + elRect.height * 0.55;
    demoCursor.style.transform = `translate(${x}px, ${y}px)`;
    later(done, 780);
  };

  const placeCursor = (x, y) => {
    demoCursor.style.transition = "none";
    demoCursor.style.transform = `translate(${x}px, ${y}px)`;
    void demoCursor.offsetHeight;
    demoCursor.style.transition = "";
  };

  const playRound = (n) => {
    const b = BRANDS[n];
    clearTimers();

    // 1. Marca troca
    setBrand(b);
    hideAnswerUI();

    // Stats resetam (sem is-in) e cards são reconstruídos
    [...demoBody.querySelectorAll(".demo__stat")].forEach((s) => s.classList.remove("is-in"));
    const cards = buildCards(b);

    // 2. Stats entram em stagger
    [...demoBody.querySelectorAll(".demo__stat")].forEach((s, i) => {
      later(() => s.classList.add("is-in"), 200 + i * 120);
    });

    // 3. Cards entram em stagger
    cards.forEach((c, i) => {
      later(() => c.classList.add("is-in"), 650 + i * 160);
    });

    const afterCards = 650 + cards.length * 160 + 300;

    // 4. Cursor aparece
    later(() => {
      const bodyRect = demoBody.getBoundingClientRect();
      placeCursor(bodyRect.width * 0.55, bodyRect.height * 0.94);
      demoCursor.classList.add("is-on");
    }, afterCards);

    // 5. Vo até a alternativa da questão-alvo
    const targetCard = cards[b.answer.card];
    const targetAlt = targetCard.querySelector(`.demo__alt[data-i="${b.answer.picked}"]`);

    later(() => {
      moveCursorTo(targetAlt, () => targetAlt.classList.add("is-hover"));
    }, afterCards + 300);

    // 6. Clique
    const clickAt = afterCards + 300 + 780 + 260;
    later(() => {
      demoCursor.classList.add("is-click");
    }, clickAt);

    // 7. Cursor some
    later(() => demoCursor.classList.remove("is-on"), clickAt + 300);

    // 8. Resultado + toast + contador
    const { card, picked, correct, comment } = b.answer;
    const ok = picked === correct;

    later(() => {
      showInCard(targetCard, picked, correct, ok, ok ? "Respondida · correta" : "Respondida · incorreta");

      demoFeedback.hidden = false;
      demoFeedback.className = `demo__toast ${ok ? "is-ok" : "is-err"}`;
      demoFeedbackIcon.textContent = ok ? "✓" : "✕";
      demoFeedbackText.textContent = ok ? "Resposta correta" : "Resposta incorreta";
      demoCommentText.textContent = comment;
      showIn(demoFeedback);

      countAcc(b.stats.acc - (ok ? 4 : 1), b.stats.acc);
    }, clickAt + 480);

    // 9. Hold e próxima marca
    const hold = clickAt + 3100;
    later(() => demoBody.classList.add("is-exiting"), hold);
    later(() => {
      current = (n + 1) % BRANDS.length;
      playRound(current);
    }, hold + 620);
  };

  const play = () => {
    if (playing || reduced) return;
    playing = true;
    playRound(current);
  };

  const pause = () => {
    playing = false;
    clearTimers();
  };

  if (reduced) {
    renderStatic(BRANDS[0], 0);
    return;
  }

  if ("IntersectionObserver" in window) {
    const demoIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play();
          else pause();
        });
      },
      { threshold: 0.25 }
    );
    demoIO.observe(demoApp);
  } else {
    play();
  }
})();
