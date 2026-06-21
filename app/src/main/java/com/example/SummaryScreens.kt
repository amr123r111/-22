package com.example

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Rule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun SummaryConfigScreen(navController: NavController, viewModel: StudyViewModel, state: StudyState) {
    var topic by remember { mutableStateOf("") }

    LaunchedEffect(state.generatedSummary) {
        if (!state.generatedSummary.isNullOrEmpty() && !state.isGeneratingSummary) {
            navController.navigate("summaryResult") {
                popUpTo("summaryConfig") { inclusive = true }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (state.isGeneratingSummary) {
            Spacer(modifier = Modifier.height(64.dp))
            CircularProgressIndicator(modifier = Modifier.size(80.dp), strokeWidth = 6.dp)
            Spacer(modifier = Modifier.height(24.dp))
            Text("جاري تلخيص المنهج واستخراج النقاط المهمة...", style = MaterialTheme.typography.titleMedium)
        } else {
            Text(
                "حدد إعدادات التلخيص الذكي",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                value = topic,
                onValueChange = { topic = it },
                label = { Text("الوحدة أو الدرس المستهدف") },
                placeholder = { Text("مثال: الفصل الأول، قوانين نيوتن...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = { 
                    viewModel.clearSummary()
                    viewModel.generateSummary(topic.ifEmpty { "المنهج كاملاً" }) 
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("توليد التلخيص", style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}

@Composable
fun SummaryResultScreen(navController: NavController, state: StudyState) {
    val summary = state.generatedSummary ?: emptyList()

    if (summary.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("لم يتم العثور على ملخص.")
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Text(
            "الملخص الذكي",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(24.dp))

        summary.forEach { item ->
            val icon = when (item.type) {
                "RULE" -> Icons.Default.Rule
                "EXAMPLE" -> Icons.Default.Lightbulb
                else -> Icons.Default.PushPin
            }
            val color = when (item.type) {
                "RULE" -> Color(0xFFE91E63)
                "EXAMPLE" -> Color(0xFFFF9800)
                else -> MaterialTheme.colorScheme.primary
            }
            val label = when (item.type) {
                "RULE" -> "قاعدة"
                "EXAMPLE" -> "مثال"
                else -> "نقطة محورية"
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = color.copy(alpha = 0.2f),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.padding(8.dp))
                        }
                        Text(label, style = MaterialTheme.typography.labelLarge, color = color)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(item.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(item.content, style = MaterialTheme.typography.bodyMedium)
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
