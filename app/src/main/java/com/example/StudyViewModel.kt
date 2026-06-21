package com.example

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@JsonClass(generateAdapter = true)
data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctAnswerIndex: Int,
    val explanation: String,
    val source: String
)

@JsonClass(generateAdapter = true)
data class SummaryItem(
    val title: String,
    val content: String,
    val type: String // "RULE", "POINT", "EXAMPLE"
)

data class StudyState(
    val uploadedFileName: String? = null,
    val isUploading: Boolean = false,
    val generatedQuiz: List<QuizQuestion>? = null,
    val isGeneratingQuiz: Boolean = false,
    val generatedSummary: List<SummaryItem>? = null,
    val isGeneratingSummary: Boolean = false,
    val userAnswers: Map<Int, Int> = emptyMap(),
    val error: String? = null
)

class StudyViewModel : ViewModel() {
    private val _state = MutableStateFlow(StudyState())
    val state: StateFlow<StudyState> = _state.asStateFlow()

    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()

    fun uploadFile(fileName: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isUploading = true, error = null)
            delay(2000) // Simulating PDF parsing time
            _state.value = _state.value.copy(uploadedFileName = fileName, isUploading = false)
        }
    }

    fun generateQuiz(topic: String, numQuestions: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isGeneratingQuiz = true, error = null)
            try {
                val apiKey = BuildConfig.GEMINI_API_KEY
                if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY" || apiKey == "MY_GEMINI_API_KEY_DEFAULT_VALUE") {
                    throw Exception("API Key is missing. Please set it in AI Studio Secrets.")
                }
                val prompt = """
                    قم بإنشاء اختبار اختيار من متعدد باللغة العربية بناءً على كتاب "${state.value.uploadedFileName ?: "المنهج الدراسي"}".
                    موضوع الاختبار: $topic
                    عدد الأسئلة: $numQuestions

                    يرجى إعادة النتيجة حصرياً بصيغة JSON كمصفوفة (Array) تحتوي على الكائنات التالية:
                    [
                      {
                        "question": "السؤال",
                        "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
                        "correctAnswerIndex": 0, // من 0 إلى 3
                        "explanation": "شرح لسبب صحة هذا الخيار",
                        "source": "الوحدة أو الصفحة المستخرج منها"
                      }
                    ]
                """.trimIndent()

                val request = GenerateContentRequest(
                    contents = listOf(Content(listOf(Part(prompt)))),
                    generationConfig = GenerationConfig(responseMimeType = "application/json")
                )

                val response = RetrofitClient.service.generateContent(apiKey, request)
                val text = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "[]"

                val listType = com.squareup.moshi.Types.newParameterizedType(List::class.java, QuizQuestion::class.java)
                val adapter: JsonAdapter<List<QuizQuestion>> = moshi.adapter(listType)

                val parsed = adapter.fromJson(text) ?: emptyList()
                _state.value = _state.value.copy(generatedQuiz = parsed, isGeneratingQuiz = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isGeneratingQuiz = false, error = e.localizedMessage ?: "حدث خطأ غير معروف أثناء إنشاء الاختبار")
            }
        }
    }

    fun generateSummary(topic: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isGeneratingSummary = true, error = null)
            try {
                val apiKey = BuildConfig.GEMINI_API_KEY
                if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY" || apiKey == "MY_GEMINI_API_KEY_DEFAULT_VALUE") {
                    throw Exception("API Key is missing. Please set it in AI Studio Secrets.")
                }
                val prompt = """
                    قم بتلخيص للدرس أو الوحدة "$topic" من كتاب "${state.value.uploadedFileName ?: "المنهج الدراسي"}".
                    يجب أن يكون التلخيص باللغة العربية ومقسماً إلى القواعد المهمة (RULE)، النقاط المحورية (POINT)، والأمثلة مع شروحاتها (EXAMPLE).
                    تجاهل الحشو الزائد.
                    
                    يرجى إعادة النتيجة حصرياً بصيغة JSON كمصفوفة (Array) تحتوي على الكائنات التالية:
                    [
                      {
                        "title": "عنوان النقطة",
                        "content": "محتوى النقطة أو التلخيص أو المثال",
                        "type": "RULE" // أو POINT أو EXAMPLE
                      }
                    ]
                """.trimIndent()

                val request = GenerateContentRequest(
                    contents = listOf(Content(listOf(Part(prompt)))),
                    generationConfig = GenerationConfig(responseMimeType = "application/json")
                )

                val response = RetrofitClient.service.generateContent(apiKey, request)
                val text = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "[]"

                val listType = com.squareup.moshi.Types.newParameterizedType(List::class.java, SummaryItem::class.java)
                val adapter: JsonAdapter<List<SummaryItem>> = moshi.adapter(listType)

                val parsed = adapter.fromJson(text) ?: emptyList()
                _state.value = _state.value.copy(generatedSummary = parsed, isGeneratingSummary = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isGeneratingSummary = false, error = e.localizedMessage ?: "حدث خطأ غير معروف أثناء إنشاء التلخيص")
            }
        }
    }
    
    fun setUserAnswer(questionIndex: Int, answerIndex: Int) {
        val currentAnswers = _state.value.userAnswers.toMutableMap()
        currentAnswers[questionIndex] = answerIndex
        _state.value = _state.value.copy(userAnswers = currentAnswers)
    }

    fun clearQuiz() {
        _state.value = _state.value.copy(generatedQuiz = null, userAnswers = emptyMap())
    }

    fun clearSummary() {
        _state.value = _state.value.copy(generatedSummary = null)
    }

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }
}
