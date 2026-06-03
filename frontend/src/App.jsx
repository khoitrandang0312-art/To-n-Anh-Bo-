import { useEffect, useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';

import BulkImportModal from './components/BulkImportModal';
import CartModal from './components/CartModal';
import ExamPartSummary from './components/ExamPartSummary';
import FilterBar from './components/FilterBar';
import Header from './components/Header';
import Pagination from './components/Pagination';
import QuestionCard from './components/QuestionCard';
import TemplateModal from './components/TemplateModal';
import YamlModal from './components/YamlModal';
import {
  deleteQuestion,
  deleteQuestions,
  fetchQuestionRaw,
  fetchQuestions,
  fetchTemplateContent,
  fetchTemplates,
  generateExam,
  getDownloadExamUrl,
  saveBulkQuestions,
  saveQuestion,
  saveTemplateContent,
  validateQuestion
} from './lib/api';
import {
  defaultQuestionTypes,
  examParts,
  getQuestionPartKey,
  getQuestionType
} from './lib/questionTypes';

const QUESTIONS_PER_PAGE = 5;

const defaultFilters = {
  topic: 'All',
  chapter: 'All',
  theme: 'All',
  difficulty: 'All',
  type: 'All'
};

const fallbackTemplates = [
  {
    id: 'thpt-2025',
    name: 'Đề THPT 2025 - 3 phần',
    description: 'Template mặc định',
    default: true
  }
];

const defaultYamlInput = `---
topic: "Đại số"
chapter: "Phương trình"
theme: "Phương trình bậc hai"
difficulty: "Cơ bản"
type: "mcq"
layout: 4
answers:
  - "$x=1$"
  - "$x=2$"
  - "$x=3$"
  - "$x=4$"
answer: "B"
solution: |
  Thay $x=2$ vào phương trình.
---
Nghiệm của phương trình $x+1=3$ là`;

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
    .sort((left, right) => String(left).localeCompare(String(right), 'vi'));
}

function withAll(values) {
  return ['All', ...values];
}

function DeleteSelectionToolbar({
  selectedCount,
  currentPageCount,
  filteredCount,
  isCurrentPageFullySelected,
  isFilteredFullySelected,
  onSelectCurrentPage,
  onSelectFiltered,
  onClear,
  onDeleteSelected
}) {
  return (
    <section className="mx-auto mb-6 max-w-6xl rounded-xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm font-semibold text-slate-600">
          Đã chọn <span className="text-red-600">{selectedCount}</span> câu hỏi để xóa
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectCurrentPage}
            disabled={currentPageCount === 0 || isCurrentPageFullySelected}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Chọn trang này
          </button>
          <button
            type="button"
            onClick={onSelectFiltered}
            disabled={filteredCount === 0 || isFilteredFullySelected}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Chọn tất cả kết quả lọc
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={selectedCount === 0}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bỏ chọn
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa đã chọn
          </button>
        </div>
      </div>
    </section>
  );
}

function getServiceErrors(error, fallbackMessage) {
  return error?.data?.errors?.length ? error.data.errors : [error.message || fallbackMessage];
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [cart, setCart] = useState([]);
  const [deleteSelection, setDeleteSelection] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [randomCount, setRandomCount] = useState(10);
  const [appError, setAppError] = useState('');

  const [templates, setTemplates] = useState(fallbackTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(fallbackTemplates[0].id);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateInput, setTemplateInput] = useState('');
  const [templateErrors, setTemplateErrors] = useState([]);

  const [showYamlModal, setShowYamlModal] = useState(false);
  const [yamlInput, setYamlInput] = useState(defaultYamlInput);
  const [newQuestionId, setNewQuestionId] = useState('');
  const [yamlErrors, setYamlErrors] = useState([]);
  const [yamlWarnings, setYamlWarnings] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  const [showCartModal, setShowCartModal] = useState(false);

  const loadQuestions = async () => {
    try {
      const data = await fetchQuestions();
      setAppError('');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      setAppError(error.message || 'Không tải được danh sách câu hỏi.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchQuestions()
      .then((data) => {
        if (cancelled) return;
        setAppError('');
        setQuestions(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!cancelled) {
          setAppError(error.message || 'Không tải được danh sách câu hỏi.');
        }
      });

    fetchTemplates()
      .then((data) => {
        if (cancelled) return;

        const nextTemplates = data.templates?.length ? data.templates : fallbackTemplates;
        const nextDefaultId = data.defaultTemplateId || nextTemplates[0].id;

        setTemplates(nextTemplates);
        setSelectedTemplateId((currentId) => (
          nextTemplates.some((template) => template.id === currentId) ? currentId : nextDefaultId
        ));
      })
      .catch(() => {
        if (!cancelled) {
          setTemplates(fallbackTemplates);
          setSelectedTemplateId(fallbackTemplates[0].id);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredQuestions = useMemo(() => (
    questions.filter((question) => {
      const matchTopic = filters.topic === 'All' || question.topic === filters.topic;
      const matchChapter = filters.chapter === 'All' || question.chapter === filters.chapter;
      const matchTheme = filters.theme === 'All' || question.theme === filters.theme;
      const matchDifficulty = filters.difficulty === 'All' || question.difficulty === filters.difficulty;
      const matchType = filters.type === 'All' || getQuestionType(question) === filters.type;

      return matchTopic && matchChapter && matchTheme && matchDifficulty && matchType;
    })
  ), [filters, questions]);

  const filterOptions = useMemo(() => {
    const byTopic = questions.filter((question) => (
      filters.topic === 'All' || question.topic === filters.topic
    ));
    const byTopicChapter = byTopic.filter((question) => (
      filters.chapter === 'All' || question.chapter === filters.chapter
    ));
    const byTopicChapterTheme = byTopicChapter.filter((question) => (
      filters.theme === 'All' || question.theme === filters.theme
    ));

    return {
      topic: withAll(uniqueValues(questions.map((question) => question.topic))),
      chapter: withAll(uniqueValues(byTopic.map((question) => question.chapter))),
      theme: withAll(uniqueValues(byTopicChapter.map((question) => question.theme))),
      difficulty: withAll(uniqueValues(byTopicChapterTheme.map((question) => question.difficulty))),
      type: withAll(uniqueValues([
        ...defaultQuestionTypes,
        ...byTopicChapterTheme.map((question) => getQuestionType(question))
      ]))
    };
  }, [filters.chapter, filters.theme, filters.topic, questions]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentQuestions = filteredQuestions.slice(
    (safeCurrentPage - 1) * QUESTIONS_PER_PAGE,
    safeCurrentPage * QUESTIONS_PER_PAGE
  );
  const currentQuestionIds = currentQuestions.map((question) => question.id);
  const filteredQuestionIds = useMemo(
    () => filteredQuestions.map((question) => question.id),
    [filteredQuestions]
  );
  const selectedDeleteIdSet = useMemo(() => new Set(deleteSelection), [deleteSelection]);
  const isCurrentPageFullySelected = currentQuestionIds.length > 0
    && currentQuestionIds.every((id) => selectedDeleteIdSet.has(id));
  const isFilteredFullySelected = filteredQuestionIds.length > 0
    && filteredQuestionIds.every((id) => selectedDeleteIdSet.has(id));

  const selectedQuestions = useMemo(
    () => questions.filter((question) => cart.includes(question.id)),
    [cart, questions]
  );

  const selectedQuestionsByPart = useMemo(() => (
    examParts.map((part) => ({
      ...part,
      questions: selectedQuestions.filter((question) => getQuestionPartKey(question) === part.key),
      availableCount: questions.filter((question) => getQuestionPartKey(question) === part.key).length
    }))
  ), [questions, selectedQuestions]);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0];

  const handleFilterChange = (field, value) => {
    setFilters((currentFilters) => {
      const nextFilters = { ...currentFilters, [field]: value };

      if (field === 'topic') {
        nextFilters.chapter = 'All';
        nextFilters.theme = 'All';
      }

      if (field === 'chapter') {
        nextFilters.theme = 'All';
      }

      return nextFilters;
    });
    setCurrentPage(1);
  };

  const toggleCart = (id) => {
    setCart((currentCart) => (
      currentCart.includes(id)
        ? currentCart.filter((item) => item !== id)
        : [...currentCart, id]
    ));
  };

  const toggleDeleteSelection = (id) => {
    setDeleteSelection((currentSelection) => (
      currentSelection.includes(id)
        ? currentSelection.filter((item) => item !== id)
        : [...currentSelection, id]
    ));
  };

  const selectCurrentPageForDelete = () => {
    setDeleteSelection((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      currentQuestionIds.forEach((id) => nextSelection.add(id));
      return [...nextSelection];
    });
  };

  const selectFilteredForDelete = () => {
    setDeleteSelection((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      filteredQuestionIds.forEach((id) => nextSelection.add(id));
      return [...nextSelection];
    });
  };

  const clearDeleteSelection = () => {
    setDeleteSelection([]);
  };

  const handleRandomPick = () => {
    const count = parseInt(randomCount, 10);

    if (Number.isNaN(count) || count <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    if (count > filteredQuestions.length) {
      alert(`Chỉ có ${filteredQuestions.length} câu hỏi phù hợp với bộ lọc hiện tại.`);
      return;
    }

    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    const nextCart = [...cart];
    let added = 0;

    selected.forEach((question) => {
      if (!nextCart.includes(question.id)) {
        nextCart.push(question.id);
        added += 1;
      }
    });

    setCart(nextCart);
    alert(`Đã thêm ${added} câu hỏi vào gói đề.`);
  };

  const resetYamlValidation = () => {
    setYamlErrors([]);
    setYamlWarnings([]);
    setValidationMessage('');
  };

  const handleOpenNewYaml = () => {
    setNewQuestionId('');
    setYamlInput(defaultYamlInput);
    resetYamlValidation();
    setShowYamlModal(true);
  };

  const handleValidateYAML = async () => {
    if (!yamlInput.trim()) {
      setYamlErrors(['Nội dung YAML đang rỗng.']);
      setYamlWarnings([]);
      setValidationMessage('');
      return false;
    }

    try {
      const result = await validateQuestion(yamlInput);
      setYamlErrors([]);
      setYamlWarnings(result.warnings || []);
      setValidationMessage('YAML hợp lệ, có thể lưu.');
      return true;
    } catch (error) {
      setYamlErrors(getServiceErrors(error, 'YAML chưa hợp lệ.'));
      setYamlWarnings(error?.data?.warnings || []);
      setValidationMessage('');
      return false;
    }
  };

  const handleSaveYAML = async () => {
    const valid = await handleValidateYAML();
    if (!valid) return;

    try {
      const result = await saveQuestion({
        id: newQuestionId.trim() || undefined,
        rawContent: yamlInput
      });

      setYamlWarnings(result.warnings || []);
      if (result.id) {
        setNewQuestionId(result.id);
      }
      setShowYamlModal(false);
      setCurrentPage(1);
      await loadQuestions();
      alert(result.id ? `Lưu câu hỏi thành công! ID: ${result.id}` : 'Lưu câu hỏi thành công!');
    } catch (error) {
      setYamlErrors(getServiceErrors(error, 'Không lưu được câu hỏi.'));
      setYamlWarnings(error?.data?.warnings || []);
    }
  };

  const handleEditQuestion = async (id) => {
    try {
      const data = await fetchQuestionRaw(id);
      setNewQuestionId(id);
      setYamlInput(data.content || '');
      resetYamlValidation();
      setShowYamlModal(true);
    } catch (error) {
      alert(`Không tải được câu hỏi: ${error.message}`);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi [${id}] không?`)) {
      return;
    }

    try {
      await deleteQuestion(id);
      setCart((currentCart) => currentCart.filter((item) => item !== id));
      setDeleteSelection((currentSelection) => currentSelection.filter((item) => item !== id));
      await loadQuestions();
    } catch (error) {
      alert(`Không xóa được câu hỏi: ${error.message}`);
    }
  };

  const handleDeleteSelectedQuestions = async () => {
    if (deleteSelection.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi để xóa.');
      return;
    }

    const previewIds = deleteSelection.slice(0, 5).join(', ');
    const extraCount = deleteSelection.length > 5 ? `, ... +${deleteSelection.length - 5}` : '';

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${deleteSelection.length} câu hỏi đã chọn (${previewIds}${extraCount}) không?`)) {
      return;
    }

    try {
      const result = await deleteQuestions(deleteSelection);
      const deletedIds = result.deletedIds?.length ? result.deletedIds : deleteSelection;
      const deletedIdSet = new Set(deletedIds);

      setCart((currentCart) => currentCart.filter((item) => !deletedIdSet.has(item)));
      setDeleteSelection((currentSelection) => currentSelection.filter((item) => !deletedIdSet.has(item)));
      await loadQuestions();
      alert(result.message || `Đã xóa ${deletedIds.length} câu hỏi.`);
    } catch (error) {
      alert(`Không xóa được các câu hỏi đã chọn: ${error.message}`);
    }
  };

  const handleOpenBulkModal = () => {
    setBulkResult(null);
    setShowBulkModal(true);
  };

  const handleSaveBulk = async () => {
    if (!bulkInput.trim()) {
      setBulkResult({
        message: 'Vui lòng nhập nội dung trước khi import.',
        skipped: []
      });
      return;
    }

    try {
      const result = await saveBulkQuestions(bulkInput);
      setBulkResult(result);
      setBulkInput(result.skipped?.length ? bulkInput : '');
      setCurrentPage(1);
      await loadQuestions();

      if (!result.skipped?.length) {
        setShowBulkModal(false);
        alert(result.message);
      }
    } catch (error) {
      setBulkResult({
        message: error.message || 'Không import được dữ liệu.',
        skipped: error?.data?.skipped || []
      });
    }
  };

  const handleOpenTemplateModal = async () => {
    try {
      const data = await fetchTemplateContent(selectedTemplateId);
      setTemplateInput(data.template || '');
      setTemplateErrors([]);
      setShowTemplateModal(true);
    } catch (error) {
      alert(`Không tải được template: ${error.message}`);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await saveTemplateContent({
        templateId: selectedTemplateId,
        templateContent: templateInput
      });
      setTemplateErrors([]);
      setShowTemplateModal(false);
      alert('Lưu template thành công!');
    } catch (error) {
      setTemplateErrors(getServiceErrors(error, 'Template chưa hợp lệ.'));
    }
  };

  const handleGenerateExam = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi!');
      return;
    }

    try {
      const result = await generateExam({
        questionIds: cart,
        templateId: selectedTemplateId
      });

      setShowCartModal(false);

      if (result.skipped?.length) {
        alert(`Đã tạo đề nhưng bỏ qua ${result.skipped.length} câu lỗi.`);
      }

      window.open(getDownloadExamUrl(), '_blank');
    } catch (error) {
      alert(`Lỗi tạo đề: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 md:p-8">
      <Header
        cartCount={cart.length}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
        onOpenBulk={handleOpenBulkModal}
        onOpenYaml={handleOpenNewYaml}
        onOpenTemplate={handleOpenTemplateModal}
        onOpenCart={() => setShowCartModal(true)}
        onGenerateExam={handleGenerateExam}
      />

      {appError && (
        <div className="mx-auto mb-6 max-w-6xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {appError}
        </div>
      )}

      <FilterBar
        filters={filters}
        options={filterOptions}
        filteredCount={filteredQuestions.length}
        randomCount={randomCount}
        onFilterChange={handleFilterChange}
        onRandomCountChange={setRandomCount}
        onRandomPick={handleRandomPick}
      />

      <ExamPartSummary parts={selectedQuestionsByPart} />

      <DeleteSelectionToolbar
        selectedCount={deleteSelection.length}
        currentPageCount={currentQuestions.length}
        filteredCount={filteredQuestions.length}
        isCurrentPageFullySelected={isCurrentPageFullySelected}
        isFilteredFullySelected={isFilteredFullySelected}
        onSelectCurrentPage={selectCurrentPageForDelete}
        onSelectFiltered={selectFilteredForDelete}
        onClear={clearDeleteSelection}
        onDeleteSelected={handleDeleteSelectedQuestions}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-6">
        {currentQuestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Không có câu hỏi phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          currentQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isSelected={cart.includes(question.id)}
              isDeleteSelected={selectedDeleteIdSet.has(question.id)}
              onToggleCart={toggleCart}
              onToggleDeleteSelection={toggleDeleteSelection}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          ))
        )}
      </main>

      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showTemplateModal && (
        <TemplateModal
          templateName={selectedTemplate?.name}
          templateInput={templateInput}
          templateErrors={templateErrors}
          onTemplateChange={setTemplateInput}
          onSave={handleSaveTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {showYamlModal && (
        <YamlModal
          questionId={newQuestionId}
          yamlInput={yamlInput}
          yamlErrors={yamlErrors}
          yamlWarnings={yamlWarnings}
          validationMessage={validationMessage}
          onQuestionIdChange={setNewQuestionId}
          onYamlChange={(value) => {
            setYamlInput(value);
            resetYamlValidation();
          }}
          onValidate={handleValidateYAML}
          onSave={handleSaveYAML}
          onClose={() => setShowYamlModal(false)}
        />
      )}

      {showBulkModal && (
        <BulkImportModal
          bulkInput={bulkInput}
          bulkResult={bulkResult}
          onBulkChange={setBulkInput}
          onSave={handleSaveBulk}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {showCartModal && (
        <CartModal
          cartCount={cart.length}
          selectedQuestionsByPart={selectedQuestionsByPart}
          onToggleCart={toggleCart}
          onGenerateExam={handleGenerateExam}
          onClose={() => setShowCartModal(false)}
        />
      )}
    </div>
  );
}

export default App;
