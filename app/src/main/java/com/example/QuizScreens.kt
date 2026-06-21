package com.example

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.delay

@Composable
fun QuizConfigScreen(navController: NavController, viewModel: StudyViewModel, state: StudyState) {
    var topic by remember { mutableStateOf("") }
    var numQuestions by remember { mutableFloatStateOf(5f) }
    var durationMins by remember { mutableFloatStateOf(5f) }

    LaunchedEffect(state.generatedQuiz) {
        if (!state.generatedQuiz.isNullOrEmpty() && !state.isGeneratingQuiz) {
            navController.navigate("quizActive/${durationMins.toInt()}") {
                popUpTo("quizConfig") { inclusive = true }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (state.isGeneratingQuiz) {
            Spacer(modifier = Modifier.height(64.dp))
            CircularProgressIndicator(modifier = Modifier.size(80.dp), strokeWidth = 6.dp)
            Spacer(modifier = Modifier.height(24.dp))
            Text("جاري استخراج الأسئلة من המنهج...", style = MaterialTheme.typography.titleMedium)
        } else {
            Text(
                "حدد إعدادات الاختبار",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                value = topic,
                onValueChange = { topic = it },
                label = { Text("الوحدة أو الدرس المستهدف") },
                placeholder = { Text("مثال: الوحدة الأولى، الخلية...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text("عدد الأسئلة: ${numQuestions.toInt()}", modifier = Modifier.align(Alignment.Start))
            Slider(
                value = numQuestions,
                onValueChange = { numQuestions = it },
                valueRange = 3f..20f,
                steps = 16
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text("مدة الاختبار: ${durationMins.toInt()} دقائق", modifier = Modifier.align(Alignment.Start))
            Slider(
                value = durationMins,
                onValueChange = { durationMins = it },
                valueRange = 1f..30f,
                steps = 28
            )

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = { 
                    viewModel.clearQuiz()
                    viewModel.generateQuiz(topic.ifEmpty { "المنهج كاملاً" }, numQuestions.toInt()) 
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("بدء الاختبار", style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}

// Local state for answers since it's transient
@Composable
fun QuizActiveScreen(navController: NavController, state: StudyState, durationMins: Int, viewModel: StudyViewModel) {
    val quiz = state.generatedQuiz ?: emptyList()
    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    var timeLeftSeconds by remember { mutableIntStateOf(durationMins * 60) }

    // Timer
    LaunchedEffect(timeLeftSeconds) {
        if (timeLeftSeconds > 0) {
            delay(1000L)
            timeLeftSeconds--
        } else {
            // Time up! Auto submit
            navController.navigate("quizResult") {
                popUpTo("quizActive/$durationMins") { inclusive = true }
            }
        }
    }

    if (quiz.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("لم يتم العثور على أسئلة.")
        }
        return
    }

    val currentQuestion = quiz[currentQuestionIndex]
    val selectedOption = state.userAnswers[currentQuestionIndex]

    Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            // Timer Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.tertiaryContainer, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.Timer, contentDescription = null, tint = MaterialTheme.colorScheme.onTertiaryContainer)
                Spacer(modifier = Modifier.width(8.dp))
                val minStr = (timeLeftSeconds / 60).toString().padStart(2, '0')
                val secStr = (timeLeftSeconds % 60).toString().padStart(2, '0')
                Text(
                    text = "$minStr:$secStr",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onTertiaryContainer
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                "السؤال ${currentQuestionIndex + 1} من ${quiz.size}",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                currentQuestion.question,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(32.dp))

            currentQuestion.options.forEachIndexed { index, optionText ->
                val isSelected = selectedOption == index
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { viewModel.setUserAnswer(currentQuestionIndex, index) },
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { viewModel.setUserAnswer(currentQuestionIndex, index) }
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Text(optionText, style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (currentQuestionIndex > 0) {
                    TextButton(onClick = { currentQuestionIndex-- }) {
                        Text("السابق")
                    }
                } else {
                    Spacer(modifier = Modifier.width(8.dp))
                }

                Button(
                    onClick = {
                        if (currentQuestionIndex < quiz.size - 1) {
                            currentQuestionIndex++
                        } else {
                            navController.navigate("quizResult") {
                                popUpTo("quizActive/$durationMins") { inclusive = true }
                            }
                        }
                    },
                    enabled = selectedOption != null
                ) {
                    if (currentQuestionIndex < quiz.size - 1) {
                        Text("التالي")
                    } else {
                        Text("إنهاء الاختبار")
                    }
                }
            }
        }
}

@Composable
fun QuizResultScreen(navController: NavController, state: StudyState) {
    val quiz = state.generatedQuiz ?: emptyList()
    val userAnswers = state.userAnswers
    
    if (quiz.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("لا توجد نتيجة.")
        }
        return
    }

    var score = 0
    quiz.forEachIndexed { index, question ->
        if (userAnswers[index] == question.correctAnswerIndex) {
            score++
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Result Header
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (score >= quiz.size / 2) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.errorContainer
            ),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                modifier = Modifier.padding(32.dp).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("النتيجة النهائية", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "$score / ${quiz.size}",
                    style = MaterialTheme.typography.displayLarge,
                    fontWeight = FontWeight.Bold,
                    color = if (score >= quiz.size / 2) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        Text(
            "مراجعة الإجابات",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.Start)
        )
        Spacer(modifier = Modifier.height(16.dp))

        quiz.forEachIndexed { index, question ->
            val userAnswer = userAnswers[index]
            val isCorrect = userAnswer == question.correctAnswerIndex

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            if (isCorrect) Icons.Default.CheckCircle else Icons.Default.Error,
                            contentDescription = null,
                            tint = if (isCorrect) Color(0xFF4CAF50) else MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(question.question, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    if (!isCorrect) {
                        Text(
                            "إجابتك: ${if (userAnswer != null) question.options[userAnswer] else "لم تجب"}",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                    Text(
                        "الإجابة الصحيحة: ${question.options[question.correctAnswerIndex]}",
                        color = Color(0xFF4CAF50),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    if (!isCorrect) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            color = MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("الشرح:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                                Text(question.explanation, style = MaterialTheme.typography.bodySmall)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("المصدر: ${question.source}", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        Button(
            onClick = { navController.navigate("home") { popUpTo(0) } },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text("العودة للرئيسية", style = MaterialTheme.typography.titleMedium)
        }
    }
}
