// script.js - main handlers for dictionary & demo features

// --------- Helper ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --------- English -> dictionaryapi.dev (Mức 2) ----------
async function lookupENG_API(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(url);
  if (!res.ok) {
    // forward error with status
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data;
}

function renderENGResult(data, word) {
  const box = document.getElementById('engResult');
  box.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    box.innerHTML = `<div class="text-red-600">Không tìm thấy định nghĩa cho "<b>${escapeHtml(word)}</b>".</div>`;
    return;
  }

  const entry = data[0];
  const title = document.createElement('div');
  title.innerHTML = `<div class="text-xl font-semibold text-indigo-700 mb-2">${escapeHtml(entry.word || word)}</div>`;
  box.appendChild(title);

  // phonetics
  if (entry.phonetics && entry.phonetics.length) {
    const ph = entry.phonetics.find(p => p.text) || entry.phonetics[0];
    if (ph && ph.text) {
      const pPh = document.createElement('div');
      pPh.className = 'text-sm text-gray-600 mb-2';
      pPh.textContent = `Phonetic: ${ph.text}`;
      box.appendChild(pPh);
    }
    // audio (nếu có)
    const audio = entry.phonetics.find(p => p.audio);
    if (audio && audio.audio) {
      const audioWrap = document.createElement('div');
      audioWrap.className = 'mb-2';
      audioWrap.innerHTML = `<audio controls src="${audio.audio}"></audio>`;
      box.appendChild(audioWrap);
    }
  }

  // meanings
  const meanings = entry.meanings || [];
  meanings.forEach((m) => {
    const part = document.createElement('div');
    part.className = 'mb-3';
    part.innerHTML = `<div class="font-medium text-indigo-600">${escapeHtml(m.partOfSpeech || '')}</div>`;

    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-gray-700';
    (m.definitions || []).forEach((d) => {
      const li = document.createElement('li');
      let html = `<div>${escapeHtml(d.definition || '')}</div>`;
      if (d.example) {
        html += `<div class="text-sm text-gray-500">Ví dụ: ${escapeHtml(d.example)}</div>`;
      }
      if (d.synonyms && d.synonyms.length) {
        html += `<div class="text-sm text-gray-500">Từ đồng nghĩa: ${escapeHtml(d.synonyms.slice(0,6).join(', '))}</div>`;
      }
      li.innerHTML = html;
      ul.appendChild(li);
    });
    part.appendChild(ul);
    box.appendChild(part);
  });

  // Google Translate link (mở tab mới)
  const translateLink = document.createElement('div');
  translateLink.className = 'mt-2';
  const gLink = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(word)}&op=translate`;
  translateLink.innerHTML = `<a href="${gLink}" target="_blank" rel="noopener" class="text-indigo-600 underline">Xem bản dịch tiếng Việt trên Google Translate</a>`;
  box.appendChild(translateLink);
}


// --------- Vietnamese -> English (simple local demo) ----------
const dictionaryVI_EN = {
  "xin chào": "hello",
  "quả táo": "apple",
  "con chó": "dog",
  "con mèo": "cat",
  "xe hơi": "car",
  "quyển sách": "book",
};

function lookupVI_Local(word) {
  const box = document.getElementById('viResult');
  box.innerHTML = '';
  if (!word) {
    box.innerHTML = `<div class="text-gray-600">Nhập từ tiếng Việt để tra.</div>`;
    return;
  }
  const key = word.trim().toLowerCase();
  if (dictionaryVI_EN[key]) {
    box.innerHTML = `<div><b>English:</b> ${escapeHtml(dictionaryVI_EN[key])}</div>
                     <div class="text-sm text-gray-500 mt-2">Lưu ý: Đây là demo local. Muốn tra rộng hơn, cần tích hợp API dịch.</div>`;
  } else {
    box.innerHTML = `<div class="text-red-600">Không tìm thấy "<b>${escapeHtml(word)}</b>" trong từ điển demo.</div>`;
  }
}

// --------- Vietnamese -> Vietnamese (simple demo definitions) ----------
const dictionaryVV = {
  "xin chào": "Lời chào xã giao, dùng để chào hỏi.",
  "yêu": "Cảm xúc thương mến sâu sắc đối với một người hoặc vật.",
  "táo": "Một loại quả, thường ăn tươi.",
};

function lookupVV_Local(word) {
  const box = document.getElementById('vvResult');
  box.innerHTML = '';
  if (!word) {
    box.innerHTML = `<div class="text-gray-600">Nhập từ để tra định nghĩa tiếng Việt.</div>`;
    return;
  }
  const key = word.trim().toLowerCase();
  if (dictionaryVV[key]) {
    box.innerHTML = `<div><b>Định nghĩa:</b> ${escapeHtml(dictionaryVV[key])}</div>`;
  } else {
    box.innerHTML = `<div class="text-red-600">Không tìm thấy "<b>${escapeHtml(word)}</b>" trong từ điển demo.</div>`;
  }
}


// --------- Small demo: chat / word of the day / quiz ----------
document.addEventListener('DOMContentLoaded', () => {
  // EN lookup handlers
  const engInput = document.getElementById('engInput');
  const engBtn = document.getElementById('engLookupBtn');

  async function doEngLookup() {
    const w = (engInput.value || '').trim();
    const box = document.getElementById('engResult');
    if (!w) {
      box.innerHTML = `<div class="text-gray-600">Nhập một từ tiếng Anh để tra.</div>`;
      return;
    }
    box.innerHTML = `<div class="text-gray-600">Đang tra từ <b>${escapeHtml(w)}</b> ...</div>`;
    try {
      const data = await lookupENG_API(w);
      renderENGResult(data, w);
    } catch (err) {
      console.error(err);
      box.innerHTML = `<div class="text-red-600">Lỗi khi tra từ: ${escapeHtml(err.message)}</div>`;
    }
  }

  if (engBtn) engBtn.addEventListener('click', doEngLookup);
  if (engInput) engInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doEngLookup();
    }
  });

  // VI lookup handlers (local demo)
  const viInput = document.getElementById('viInput');
  const viBtn = document.getElementById('viLookupBtn');
  if (viBtn) viBtn.addEventListener('click', () => {
    lookupVI_Local(viInput.value);
  });
  if (viInput) viInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupVI_Local(viInput.value);
    }
  });

  // VV lookup
  const vvInput = document.getElementById('vvInput');
  const vvBtn = document.getElementById('vvLookupBtn');
  if (vvBtn) vvBtn.addEventListener('click', () => {
    lookupVV_Local(vvInput.value);
  });
  if (vvInput) vvInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupVV_Local(vvInput.value);
    }
  });

  // Word of the day demo
  const wod = document.getElementById('wordOfTheDay');
  if (wod) {
    const word = "serendipity";
    wod.querySelector('.text-3xl').textContent = word;
    wod.querySelector('.text-gray-600').textContent = "A fortunate discovery or pleasant surprise.";
  }

  // Chat demo (simple local)
  const sendBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatContainer = document.getElementById('chatContainer');

  if (sendBtn && chatInput && chatContainer) {
    sendBtn.addEventListener('click', () => {
      const text = chatInput.value.trim();
      if (!text) return;
      const you = document.createElement('div');
      you.className = 'bg-white p-2 rounded mb-2';
      you.textContent = 'You: ' + text;
      chatContainer.appendChild(you);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      chatInput.value = '';

      // bot reply demo
      setTimeout(() => {
        const bot = document.createElement('div');
        bot.className = 'bg-indigo-50 p-2 rounded mb-2';
        bot.textContent = 'AI: Xin chào! Tôi là nhân vật AI demo.';
        chatContainer.appendChild(bot);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 600);
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  // Quiz demo
  const startQuizBtn = document.getElementById('startQuizBtn');
  const quizContainer = document.getElementById('quizContainer');
  if (startQuizBtn && quizContainer) {
    startQuizBtn.addEventListener('click', () => {
      quizContainer.innerHTML = `
        <div class="p-4">
          <div class="mb-2">1) Choose the correct past form for "go":</div>
          <button class="mr-2 px-3 py-1 bg-gray-100 rounded">went</button>
          <button class="mr-2 px-3 py-1 bg-gray-100 rounded">goed</button>
          <div class="mt-3 text-sm text-gray-600">(This is a demo question.)</div>
        </div>
      `;
    });
  }
});
