import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

function App() {
  const [questions, setQuestions] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Trạng thái cho bộ lọc
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterChapter, setFilterChapter] = useState('All');
  const [filterTheme, setFilterTheme] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const questionTypeLabels = {
    mcq: 'Trắc nghiệm',
    true_false: 'Đúng/Sai',
    dung_sai: 'Đúng/Sai',
    short_answer: 'Trả lời ngắn',
    short_answer_4: 'Trả lời ngắn 4 ý',
    essay: 'Tự luận'
  };

  const defaultQuestionTypes = ['mcq', 'true_false', 'dung_sai', 'short_answer', 'short_answer_4', 'essay'];
  const examParts = [
    {
      key: 'part1',
      label: 'Phần I',
      name: 'Trắc nghiệm',
      rule: 'type: mcq',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      key: 'part2',
      label: 'Phần II',
      name: 'Đúng/Sai',
      rule: 'type: true_false, dung_sai',
      badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    },
    {
      key: 'part3',
      label: 'Phần III',
      name: 'Trả lời ngắn',
      rule: 'type: short_answer, short_answer_4',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  ];

  const getQuestionType = (question) => question.type || (question.answers?.length ? 'mcq' : 'essay');
  const formatQuestionType = (type) => questionTypeLabels[type] || type;
  const getQuestionPartKey = (question) => {
    const type = getQuestionType(question);
    if (type === 'mcq') return 'part1';
    if (type === 'true_false' || type === 'dung_sai') return 'part2';
    return 'part3';
  };
  const getQuestionPart = (question) => examParts.find(part => part.key === getQuestionPartKey(question)) || examParts[2];
  const getTrueFalseStatements = (question) => {
    const statements = question.statements || question.items || question.assertions || question.answers || [];
    if (!Array.isArray(statements)) return [];

    return statements
      .map(item => {
        if (typeof item === 'string') return item;
        return item.text || item.statement || item.content || item.label || '';
      })
      .filter(Boolean);
  };

  // Trạng thái cho Modal nhập YAML
  const [showModal, setShowModal] = useState(false);
  const [yamlInput, setYamlInput] = useState('');
  const [newQuestionId, setNewQuestionId] = useState('Q_NEW_1');

  // Trạng thái cho Modal Nhập Hàng Loạt
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // Trạng thái cho Modal Giỏ Câu Hỏi
  const [showCartModal, setShowCartModal] = useState(false);

  // Trạng thái cho Modal Cấu hình Template
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateInput, setTemplateInput] = useState('');

  // Trạng thái cho tính năng Bốc Random
  const [randomCount, setRandomCount] = useState(10);

  const fetchQuestions = () => {
    fetch('http://localhost:3000/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error("Lỗi khi tải dữ liệu:", err));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleCart = (id) => {
    setCart(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredQuestions = questions.filter(q => {
    const matchTopic = filterTopic === 'All' || filterTopic === '' || q.topic === filterTopic;
    const matchDifficulty = filterDifficulty === 'All' || filterDifficulty === '' || q.difficulty === filterDifficulty;
    const matchChapter = filterChapter === 'All' || filterChapter === '' || q.chapter === filterChapter;
    const matchTheme = filterTheme === 'All' || filterTheme === '' || q.theme === filterTheme;
    const matchType = filterType === 'All' || filterType === '' || getQuestionType(q) === filterType;
    return matchTopic && matchDifficulty && matchChapter && matchTheme && matchType;
  });

  const handleRandomPick = () => {
    const count = parseInt(randomCount, 10);
    if (isNaN(count) || count <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    if (count > filteredQuestions.length) {
      alert(`Chỉ có ${filteredQuestions.length} câu hỏi phù hợp với bộ lọc hiện tại. Không thể bốc ${count} câu!`);
      return;
    }
    
    // Trộn ngẫu nhiên mảng câu hỏi đã lọc (Fisher-Yates style shuffle cơ bản)
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // Thêm các ID mới vào Giỏ (tránh trùng lặp với các câu đã có)
    const newCart = [...cart];
    let added = 0;
    selected.forEach(q => {
      if (!newCart.includes(q.id)) {
        newCart.push(q.id);
        added++;
      }
    });
    
    setCart(newCart);
    alert(`Đã bốc ngẫu nhiên và thêm thành công ${added} câu hỏi vào Giỏ! Mời bạn mở Giỏ (Cart) để kiểm tra.`);
  };

  const handleSaveYAML = () => {
    fetch('http://localhost:3000/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newQuestionId,
        rawContent: yamlInput
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setShowModal(false);
        fetchQuestions();
        alert("Lưu câu hỏi thành công!");
      }
    })
    .catch(err => alert("Có lỗi xảy ra: " + err));
  };

  const handleSaveBulk = () => {
    if (!bulkInput.trim()) {
      alert("Vui lòng nhập nội dung!");
      return;
    }
    fetch('http://localhost:3000/api/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulkContent: bulkInput })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setShowBulkModal(false);
        setBulkInput('');
        fetchQuestions();
        alert(data.message);
      } else {
        alert("Lỗi: " + data.error);
      }
    })
    .catch(err => alert("Lỗi khi nhập hàng loạt: " + err));
  };

  const handleOpenTemplateModal = () => {
    fetch('http://localhost:3000/api/template')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplateInput(data.template);
          setShowTemplateModal(true);
        } else {
          alert("Lỗi: " + data.error);
        }
      })
      .catch(err => alert("Có lỗi xảy ra khi lấy template: " + err));
  };

  const handleSaveTemplate = () => {
    fetch('http://localhost:3000/api/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateContent: templateInput })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setShowTemplateModal(false);
        alert("Cập nhật Template LaTeX thành công!");
      } else {
        alert("Lỗi: " + data.error);
      }
    })
    .catch(err => alert("Lỗi khi lưu template: " + err));
  };

  const handleGenerateExam = () => {
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 câu hỏi!");
      return;
    }
    fetch('http://localhost:3000/api/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds: cart })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.open(`http://localhost:3000/download-exam`, '_blank');
      } else {
        alert("Lỗi tạo đề: " + data.error);
      }
    })
    .catch(err => alert("Lỗi khi tải đề thi: " + err));
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi mang mã [ ${id} ] không? Hành động này không thể hoàn tác.`)) {
      fetch(`http://localhost:3000/api/questions/${id}`, {
        method: 'DELETE',
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchQuestions();
        } else {
          alert("Có lỗi: " + data.error);
        }
      })
      .catch(err => alert("Lỗi khi xóa câu hỏi: " + err));
    }
  };

  const handleEditQuestion = (id) => {
    fetch(`http://localhost:3000/api/questions/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNewQuestionId(id);
          setYamlInput(data.content);
          setShowModal(true);
        } else {
          alert("Lỗi: " + data.error);
        }
      })
      .catch(err => alert("Có lỗi xảy ra khi lấy câu hỏi: " + err));
  };


  // LOGIC PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5; // Hiển thị 5 câu 1 trang
  
  // Hàm tự động sửa các lỗi gõ sai LaTeX phổ biến (ví dụ AI sinh nhầm \c u p thay vì \cup)
  const autoFixLatex = (latex) => {
    if (!latex) return "";
    return latex
      .replace(/\\c\s*u\s*p/g, "\\cup")
      .replace(/\\c\{u\}p/g, "\\cup")
      .replace(/\\c\s*a\s*p/g, "\\cap")
      .replace(/\\c\{a\}p/g, "\\cap");
  };

  const renderKatexHtml = (math, displayMode = false) => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return null;
    }
  };

  const shouldUseDisplayStyle = (math) => /\\(?:frac|dfrac|tfrac|binom|sum|prod|int|lim)\b/.test(math);

  const prepareInlineMath = (math) => {
    const fixedMath = autoFixLatex(math).trim();
    const alreadyHasStyle = /\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b/.test(fixedMath);
    if (shouldUseDisplayStyle(fixedMath) && !alreadyHasStyle) {
      return `\\displaystyle ${fixedMath}`;
    }
    return fixedMath;
  };

  const renderInlineMath = (math, key) => {
    const fixedMath = prepareInlineMath(math);
    const html = renderKatexHtml(fixedMath, false);
    if (!html) {
      return <span key={key} className="font-mono text-sm text-red-600">{fixedMath}</span>;
    }

    return (
      <span
        key={key}
        className="align-baseline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const renderBlockMath = (math, key) => {
    const fixedMath = autoFixLatex(math);
    const html = renderKatexHtml(fixedMath, true);
    if (!html) {
      return <pre key={key} className="my-3 overflow-x-auto rounded bg-red-50 p-3 font-mono text-sm text-red-600">{fixedMath}</pre>;
    }

    return (
      <div
        key={key}
        className="my-3 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const renderPlainText = (text, keyPrefix) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={`${keyPrefix}-line-${lineIdx}`}>
          {boldParts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={`${keyPrefix}-strong-${lineIdx}-${partIdx}`}>{part.slice(2, -2)}</strong>;
            }
            return <span key={`${keyPrefix}-text-${lineIdx}-${partIdx}`}>{part}</span>;
          })}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const renderInlineTextWithMath = (text, keyPrefix) => {
    const inlineParts = text.split(/\$(.*?)\$/g);
    return inlineParts.map((part, index) => {
      if (index % 2 === 1) {
        return renderInlineMath(part, `${keyPrefix}-inline-${index}`);
      }
      return renderPlainText(part, `${keyPrefix}-plain-${index}`);
    });
  };

  const renderMathTextBlock = (text, keyPrefix) => {
    const blockParts = text.split(/\$\$(.*?)\$\$/gs);
    return blockParts.map((part, index) => {
      if (index % 2 === 1) {
        return renderBlockMath(part, `${keyPrefix}-block-${index}`);
      }
      return renderInlineTextWithMath(part, `${keyPrefix}-text-${index}`);
    });
  };

  const renderCodeBlock = (language, code, key) => {
    const isTikz = /\\begin\{tikzpicture\}|\\draw|\\coordinate/.test(code);
    if (isTikz) return null;

    return (
      <details
        key={key}
        className="my-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        open
      >
        <summary className="cursor-pointer select-none px-3 py-2 font-semibold text-slate-600">
          {`Mã ${language || 'code'}`}
        </summary>
        <pre className="max-h-80 overflow-auto border-t border-slate-200 p-3 text-xs leading-relaxed text-slate-700">
          <code>{code.trim()}</code>
        </pre>
      </details>
    );
  };

  const renderTextWithMath = (text) => {
    if (!text) return null;
    
    // Fix AI typos (e.g. Sf(x) instead of $f(x))
    const cleanedText = text.replace(/Sf\(x\)/g, "$f(x)");
    const codeFencePattern = /```([A-Za-z0-9_-]+)?[^\S\n]*\n([\s\S]*?)(?:```|$)/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let index = 0;

    while ((match = codeFencePattern.exec(cleanedText)) !== null) {
      const before = cleanedText.slice(lastIndex, match.index);
      if (before) {
        nodes.push(renderMathTextBlock(before, `md-${index}`));
      }
      nodes.push(renderCodeBlock(match[1], match[2], `code-${index}`));
      lastIndex = codeFencePattern.lastIndex;
      index += 1;
    }

    const after = cleanedText.slice(lastIndex);
    if (after) {
      nodes.push(renderMathTextBlock(after, `md-${index}`));
    }

    return nodes;
  };

  const renderAnswer = (ans) => {
    if (!ans) return null;
    let cleanedAns = ans.trim();
    if (cleanedAns.startsWith('$') && cleanedAns.endsWith('S')) {
      cleanedAns = cleanedAns.slice(0, -1) + '$';
    }
    if (cleanedAns.includes('$')) {
      return renderTextWithMath(cleanedAns);
    }
    return renderInlineMath(cleanedAns, `answer-${cleanedAns}`);
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const selectedQuestions = questions.filter(q => cart.includes(q.id));
  const selectedQuestionsByPart = examParts.map(part => ({
    ...part,
    questions: selectedQuestions.filter(q => getQuestionPartKey(q) === part.key),
    availableCount: questions.filter(q => getQuestionPartKey(q) === part.key).length
  }));

  // Logic lọc phân cấp (Cascading Filters)
  const topics = ['All', ...new Set(questions.map(q => q.topic).filter(Boolean))];
  
  // Khi chọn Môn học, chỉ hiện các Chương thuộc Môn học đó
  const availableChaptersList = questions.filter(q => filterTopic === 'All' || filterTopic === '' || q.topic === filterTopic);
  const chapters = ['All', ...new Set(availableChaptersList.map(q => q.chapter).filter(Boolean))];
  
  // Khi chọn Chương, chỉ hiện các Chủ đề thuộc Chương đó
  const availableThemesList = availableChaptersList.filter(q => filterChapter === 'All' || filterChapter === '' || q.chapter === filterChapter);
  const themes = ['All', ...new Set(availableThemesList.map(q => q.theme).filter(Boolean))];

  // Độ khó thì lấy từ danh sách câu hỏi đã lọc theo Môn học và Chương
  const difficulties = ['All', ...new Set(availableThemesList.map(q => q.difficulty).filter(Boolean))];
  const questionTypes = ['All', ...new Set([
    ...defaultQuestionTypes,
    ...availableThemesList.map(q => getQuestionType(q)).filter(Boolean)
  ])];

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 6; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-blue-900 flex items-center justify-center md:justify-start gap-2">
            <span className="text-blue-600 text-4xl">∑</span> 
            Toán Anh Bo
            <span className="text-blue-500 text-2xl ml-1">∞</span>
          </h1>
          <p className="text-slate-500 mt-1">Ăn - Ngủ - Sáng tạo.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold hover:bg-orange-200 transition-colors border border-orange-300"
          >
            📦 Nhập Hàng Loạt
          </button>
          <button 
            onClick={() => {
              setNewQuestionId('Q_NEW_1');
              setYamlInput(`---\ntopic: "Đại số"\nchapter: "Phương trình"\ntheme: "Bậc hai"\ndifficulty: "Cơ bản"\ntype: "mcq"\nequation: "x = \\\\frac{-b \\\\pm \\\\sqrt{\\\\Delta}}{2a}"\nanswers: \n  - "x_1 = 2"\n  - "x_2 = -3"\n  - "x = 0"\n  - "\\\\emptyset"\n---\nNội dung câu hỏi mới của bạn ở đây...`);
              setShowModal(true);
            }}
            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors border border-emerald-300"
          >
            + Nhập YAML
          </button>
          
          <button 
            onClick={handleOpenTemplateModal}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition-colors border border-purple-300"
          >
            ⚙️ Sửa Template
          </button>

          <div 
            onClick={() => setShowCartModal(true)}
            className="bg-white px-5 py-2 rounded-lg border border-slate-300 flex items-center gap-3 shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
            title="Xem Gói Câu Hỏi đang chọn"
          >
            <span className="text-slate-600 font-medium">Giỏ:</span>
            <span className="bg-blue-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm">
              {cart.length}
            </span>
          </div>
          <button 
            onClick={handleGenerateExam}
            className={`px-5 py-2 rounded-lg font-bold transition-all shadow-md ${cart.length > 0 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            disabled={cart.length === 0}
          >
            Tạo Đề THPT
          </button>
        </div>
      </header>

      {/* Vùng Bộ Lọc (Filter) - Cải tiến thành Input có Datalist để Search dễ dàng */}
      <div className="max-w-5xl mx-auto mb-8 bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end shadow-sm">
        <span className="font-bold text-slate-700 mr-2 self-center">Bộ lọc (gõ để tìm):</span>
        
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phân môn</label>
          <input 
            list="topicList"
            className="bg-slate-50 border border-slate-300 text-slate-700 p-2 rounded-lg outline-none focus:border-blue-500 w-[140px] text-sm"
            value={filterTopic}
            onChange={(e) => {
              setFilterTopic(e.target.value);
              setFilterChapter('All');
              setFilterTheme('All');
              setCurrentPage(1);
            }}
            placeholder="Môn học..."
            title="Xóa trống để chọn Tất cả"
          />
          <datalist id="topicList">
            {topics.map(t => <option key={t} value={t}>{t === 'All' ? 'Tất cả các môn' : t}</option>)}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Chương</label>
          <input 
            list="chapterList"
            className="bg-slate-50 border border-slate-300 text-slate-700 p-2 rounded-lg outline-none focus:border-purple-500 w-[140px] text-sm"
            value={filterChapter}
            onChange={(e) => {
              setFilterChapter(e.target.value);
              setFilterTheme('All');
              setCurrentPage(1);
            }}
            placeholder="Chương..."
          />
          <datalist id="chapterList">
            {chapters.map(c => <option key={c} value={c}>{c === 'All' ? 'Tất cả chương' : c}</option>)}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Chủ đề</label>
          <input 
            list="themeList"
            className="bg-slate-50 border border-slate-300 text-slate-700 p-2 rounded-lg outline-none focus:border-pink-500 w-[140px] text-sm"
            value={filterTheme}
            onChange={(e) => {
              setFilterTheme(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Chủ đề..."
          />
          <datalist id="themeList">
            {themes.map(t => <option key={t} value={t}>{t === 'All' ? 'Tất cả chủ đề' : t}</option>)}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Mức độ</label>
          <input 
            list="difficultyList"
            className="bg-slate-50 border border-slate-300 text-slate-700 p-2 rounded-lg outline-none focus:border-emerald-500 w-[140px] text-sm"
            value={filterDifficulty}
            onChange={(e) => {
              setFilterDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Độ khó..."
          />
          <datalist id="difficultyList">
            {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'Mọi độ khó' : d}</option>)}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Loại bài tập</label>
          <input
            list="typeList"
            className="bg-slate-50 border border-slate-300 text-slate-700 p-2 rounded-lg outline-none focus:border-cyan-500 w-[150px] text-sm"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Loại bài tập..."
          />
          <datalist id="typeList">
            {questionTypes.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'Tất cả loại câu' : `${t} (${formatQuestionType(t)})`}
              </option>
            ))}
          </datalist>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Tìm thấy <span className="font-bold text-blue-600">{filteredQuestions.length}</span> câu hỏi
          </div>
          <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-lg border border-amber-200 shadow-sm">
            <input 
              type="number" 
              min="1" 
              max={filteredQuestions.length || 1} 
              value={randomCount} 
              onChange={e => setRandomCount(e.target.value)} 
              className="w-16 p-1 border border-amber-300 rounded text-center outline-none text-sm font-bold text-amber-800 bg-white"
              title="Số lượng câu muốn bốc"
            />
            <button 
              onClick={handleRandomPick}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
              title="Bốc ngẫu nhiên và thêm vào Giỏ"
            >
              🎲 Bốc Ngẫu Nhiên
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        {selectedQuestionsByPart.map(part => (
          <div key={part.key} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border ${part.badgeClass}`}>
                {part.label}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {part.questions.length} đã chọn
              </span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-slate-800">{part.name}</div>
              <div className="text-xs text-slate-500 mt-1">{part.rule}</div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Ngân hàng: <span className="font-bold text-slate-700">{part.availableCount}</span> câu
            </div>
          </div>
        ))}
      </section>

      {/* Danh sách câu hỏi */}
      <main className="max-w-5xl mx-auto flex flex-col gap-6">
        {currentQuestions.map((q) => {
          const isSelected = cart.includes(q.id);
          const questionType = getQuestionType(q);
          const questionPart = getQuestionPart(q);
          const trueFalseStatements = getTrueFalseStatements(q);
          const isTrueFalseQuestion = questionType === 'true_false' || questionType === 'dung_sai';
          return (
            <div 
              key={q.id} 
              className={`bg-white rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-400 ring-1 ring-blue-400 bg-blue-50/30' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 flex-wrap gap-4">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-md border ${questionPart.badgeClass}`}>
                    {questionPart.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                    {formatQuestionType(questionType)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-md">
                    {q.topic}
                  </span>
                  {q.chapter && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-md">
                      {q.chapter}
                    </span>
                  )}
                  {q.theme && (
                    <span className="text-xs font-semibold text-pink-700 bg-pink-100 px-3 py-1 rounded-md">
                      {q.theme}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-md">
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">ID: {q.id}</span>
                  {q.createdAt && (
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded flex items-center gap-1 border border-slate-200" title="Ngày thêm câu hỏi">
                      🕒 {new Date(q.createdAt).toLocaleDateString('vi-VN')} {new Date(q.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => handleEditQuestion(q.id)}
                    className="px-3 py-1.5 rounded-lg font-bold text-sm text-purple-600 hover:bg-purple-50 hover:text-purple-800 transition-all border border-transparent hover:border-purple-200 flex items-center gap-1"
                    title="Sửa câu hỏi này"
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="px-3 py-1.5 rounded-lg font-bold text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-200 flex items-center gap-1"
                    title="Xóa câu hỏi này"
                  >
                    🗑 Xóa
                  </button>
                  <button 
                    onClick={() => toggleCart(q.id)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white border border-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Đã thêm' : '+ Thêm vào đề'}
                  </button>
                </div>
              </div>
              
              <div className="mb-6 text-slate-800 text-lg leading-relaxed flex flex-col gap-4">
                <div className="flex-1 w-full">
                  <div className="mb-4 leading-relaxed">{renderTextWithMath(q.content)}</div>
                  
                  {q.image && (
                    <div className="mb-4 flex justify-center w-full">
                      <img src={q.image} alt="Minh họa" className="max-w-full rounded-lg border border-slate-200 shadow-sm" />
                    </div>
                  )}

                  {q.equation && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto text-blue-900 mb-6">
                      {renderBlockMath(q.equation, `equation-${q.id}`)}
                    </div>
                  )}
                </div>
              </div>

              {isTrueFalseQuestion ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trueFalseStatements.map((statement, idx) => (
                    <div key={idx} className="flex gap-3 text-slate-700 items-start p-3 rounded-lg border border-cyan-100 bg-cyan-50/70">
                      <span className="w-6 h-6 rounded-full bg-white border border-cyan-200 text-xs flex items-center justify-center font-bold text-cyan-700 shrink-0">
                        {String.fromCharCode(97 + idx)}
                      </span>
                      <div className="overflow-x-auto overflow-y-hidden">
                        {renderTextWithMath(statement)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : q.answers && q.answers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {q.answers.map((ans, idx) => (
                    <div key={idx} className="flex gap-3 text-slate-700 items-center p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-xs flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="overflow-x-auto overflow-y-hidden">
                        {renderAnswer(ans)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-500">
                  <p className="text-sm font-semibold mb-2">Câu hỏi trả lời ngắn / tự luận:</p>
                  <input type="text" placeholder="Nhập đáp án của bạn..." className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" disabled />
                </div>
              )}
            </div>
          )
        })}
      </main>

      {/* Giao diện Phân Trang (Pagination) Rút gọn */}
      {totalPages > 1 && (
        <div className="max-w-5xl mx-auto mt-8 flex justify-center items-center gap-1.5">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${currentPage === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            &lt;
          </button>
          
          <div className="flex gap-1.5">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center bg-slate-200 text-slate-600 rounded font-bold">...</span>;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-bold transition-all ${currentPage === page ? 'bg-red-800 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${currentPage === totalPages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modal Sửa Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 bg-purple-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-purple-800">⚙️ Chỉnh sửa Template LaTeX (.tex)</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Hãy giữ lại các điểm chèn <code className="bg-slate-100 text-purple-600 font-bold px-1 py-0.5 rounded">% --- PHAN_I_CAU_HOI ---</code>, <code className="bg-slate-100 text-purple-600 font-bold px-1 py-0.5 rounded">% --- PHAN_II_CAU_HOI ---</code>, <code className="bg-slate-100 text-purple-600 font-bold px-1 py-0.5 rounded">% --- PHAN_III_CAU_HOI ---</code>.
              </p>
              <textarea 
                value={templateInput}
                onChange={(e) => setTemplateInput(e.target.value)}
                className="w-full border border-slate-300 p-4 rounded-lg outline-none focus:border-purple-500 h-[60vh] font-mono text-sm bg-slate-50 leading-relaxed text-slate-800 whitespace-pre"
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Hủy</button>
              <button onClick={handleSaveTemplate} className="px-4 py-2 rounded-lg font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md">Lưu Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập YAML */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Thêm câu hỏi mới (Markdown + YAML)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Mã câu hỏi (ID):</label>
                <input 
                  type="text" 
                  value={newQuestionId}
                  onChange={(e) => setNewQuestionId(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500"
                  placeholder="Ví dụ: Q_NEW_1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Nội dung (YAML + Text):</label>
                <textarea 
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-blue-500 h-64 font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Hủy</button>
              <button onClick={handleSaveYAML} className="px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md">Lưu vào Server</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập Hàng Loạt */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 bg-orange-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-orange-800">📦 Nhập Hàng Loạt (Hàng trăm câu)</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                Hãy nhắc AI dán đoạn mã này vào cuối mỗi câu hỏi: <code className="bg-slate-100 text-orange-600 font-bold px-1 py-0.5 rounded">---END_QUESTION---</code>
              </p>
              <textarea 
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Dán toàn bộ kết quả từ AI vào đây...&#10;&#10;---&#10;topic: 'Toán'&#10;...&#10;---&#10;Câu hỏi 1&#10;---END_QUESTION---&#10;---&#10;topic: 'Lý'&#10;...&#10;---&#10;Câu hỏi 2"
                className="w-full border border-slate-300 p-4 rounded-lg outline-none focus:border-orange-500 h-[60vh] font-mono text-sm bg-slate-50 leading-relaxed text-slate-800 whitespace-pre"
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200">Hủy</button>
              <button onClick={handleSaveBulk} className="px-4 py-2 rounded-lg font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-md">Nhập Tất Cả</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Giỏ Câu Hỏi (Cart) */}
      {showCartModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 bg-blue-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-blue-800">🛒 Gói Câu Hỏi Đã Chọn ({cart.length})</h3>
              <button onClick={() => setShowCartModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-3 overflow-y-auto bg-slate-50">
              {cart.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
                  <span className="text-6xl mb-4 opacity-50">📭</span>
                  <p className="text-slate-500 font-medium">Chưa có câu hỏi nào trong gói.</p>
                  <p className="text-slate-400 text-sm mt-1">Hãy đóng cửa sổ và bấm "+ Thêm vào đề" ở các câu hỏi bên ngoài nhé.</p>
                </div>
              ) : (
                selectedQuestionsByPart.map(part => (
                  <section key={part.key} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border ${part.badgeClass}`}>
                          {part.label}
                        </span>
                        <span className="font-bold text-slate-700 text-sm">{part.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{part.questions.length} câu</span>
                    </div>

                    <div className="p-3 flex flex-col gap-2">
                      {part.questions.length === 0 ? (
                        <div className="text-xs text-slate-400 px-2 py-3">Chưa có câu hỏi trong phần này.</div>
                      ) : (
                        part.questions.map((q, idx) => (
                          <div key={q.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                            <div className="flex-1 mr-4">
                              <div className="flex gap-2 items-center mb-1 flex-wrap">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">Câu {idx + 1}</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{formatQuestionType(getQuestionType(q))}</span>
                                <span className="font-bold text-slate-700 text-sm">{q.topic} - {q.chapter}</span>
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1 italic">{q.content}</div>
                              <div className="text-xs text-blue-500 mt-1">ID: {q.id}</div>
                            </div>
                            <button 
                              onClick={() => toggleCart(q.id)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white border border-red-200 transition-colors text-xs font-bold whitespace-nowrap shadow-sm"
                            >
                              Bỏ chọn
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
              <button onClick={() => setShowCartModal(false)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 border border-slate-200">Đóng</button>
              {cart.length > 0 && (
                <button 
                  onClick={() => {
                    setShowCartModal(false);
                    handleGenerateExam();
                  }} 
                  className="px-6 py-2 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-transform active:scale-95"
                >
                  Tạo Đề THPT Ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
