package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.Group
import com.example.data.model.Member
import com.example.data.repository.TicketSplitRepository
import com.example.ui.TicketSplitViewModel
import com.example.ui.theme.EmeraldContainer
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.IndigoFixed
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintOnPrimaryFixed
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.SurfaceBg
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHigh
import com.example.ui.theme.SurfaceContainerHighest
import com.example.ui.theme.SurfaceContainerLow
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TertiaryContainer
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun AddExpenseScreen(
  viewModel: TicketSplitViewModel,
  group: Group,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  var amountInput by remember { mutableStateOf("2840") }
  var descriptionInput by remember { mutableStateOf("Monthly Groceries & Bisleri cans") }
  var selectedCategory by remember { mutableStateOf("Groceries") }
  var selectedCategoryEmoji by remember { mutableStateOf("🛒") }
  var paidByMember by remember { mutableStateOf(TicketSplitRepository.CURRENT_USER) }
  var selectedSplitTab by remember { mutableStateOf("Equally") }
  var attachedReceipt by remember { mutableStateOf<String?>("grocery_bill_oct.jpg") }

  // Flatmates included in split
  val allMembers = group.members
  var includedMemberIds by remember {
    mutableStateOf(allMembers.map { it.id }.toSet())
  }

  val categories = listOf(
    Pair("Groceries", "🛒"),
    Pair("Utilities", "⚡"),
    Pair("Rent & Maid", "🏠"),
    Pair("Food & Drinks", "🍕"),
    Pair("Travel", "🚕"),
    Pair("Fun", "🎟️")
  )

  val parsedAmount = amountInput.toDoubleOrNull() ?: 0.0
  val splitCount = includedMemberIds.size.coerceAtLeast(1)
  val perPersonAmount = parsedAmount / splitCount

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .background(SurfaceBg),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 100.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Group Selector Tag
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.Center
        ) {
          Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceContainerHigh,
            modifier = Modifier.clickable { viewModel.showToast("Selected group: ${group.name}") }
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Text(
                text = "Flat 402 (HSR)",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = TextPrimary
              )
              Icon(
                imageVector = Icons.Default.ArrowDropDown,
                contentDescription = null,
                tint = TextSecondary,
                modifier = Modifier.size(18.dp)
              )
            }
          }
        }
      }

      // Giant Currency Amount Card
      item {
        Surface(
          shape = RoundedCornerShape(24.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("amount_input_card")
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Text(
              text = "ENTER AMOUNT",
              style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
              ),
              color = TextSecondary
            )

            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center,
              modifier = Modifier.fillMaxWidth()
            ) {
              Text(
                text = "₹",
                style = MaterialTheme.typography.displayLarge.copy(
                  fontWeight = FontWeight.Bold,
                  fontSize = 40.sp
                ),
                color = EmeraldPrimary,
                modifier = Modifier.padding(end = 4.dp)
              )
              OutlinedTextField(
                value = amountInput,
                onValueChange = { amountInput = it.filter { ch -> ch.isDigit() || ch == '.' } },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                textStyle = MaterialTheme.typography.displayLarge.copy(
                  fontWeight = FontWeight.ExtraBold,
                  fontSize = 38.sp,
                  textAlign = TextAlign.Start
                ),
                colors = OutlinedTextFieldDefaults.colors(
                  focusedBorderColor = Color.Transparent,
                  unfocusedBorderColor = Color.Transparent,
                  focusedTextColor = TextPrimary,
                  unfocusedTextColor = TextPrimary
                ),
                modifier = Modifier
                  .width(180.dp)
                  .testTag("amount_text_field"),
                singleLine = true
              )
            }

            // Split equally dynamic calculation pill
            Surface(
              shape = RoundedCornerShape(16.dp),
              color = MintPrimaryFixed
            ) {
              Text(
                text = "Split equally: ₹${String.format("%.2f", perPersonAmount)} / person",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = MintOnPrimaryFixed,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
              )
            }
          }
        }
      }

      // Title & Description Input
      item {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier.fillMaxWidth()
        ) {
          OutlinedTextField(
            value = descriptionInput,
            onValueChange = { descriptionInput = it },
            placeholder = { Text("What was this for? (e.g., Blinkit restock)") },
            trailingIcon = {
              if (descriptionInput.isNotEmpty()) {
                IconButton(onClick = { descriptionInput = "" }) {
                  Icon(Icons.Default.Clear, contentDescription = "Clear")
                }
              }
            },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = Color.Transparent,
              unfocusedBorderColor = Color.Transparent
            ),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("expense_description_input")
          )
        }
      }

      // Category Chips Horizontal Scroll
      item {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "Category",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
          )
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            categories.forEach { (catName, catEmoji) ->
              val isSelected = selectedCategory == catName
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (isSelected) EmeraldPrimary else SurfaceContainerLowest,
                shadowElevation = if (isSelected) 2.dp else 1.dp,
                modifier = Modifier
                  .clickable {
                    selectedCategory = catName
                    selectedCategoryEmoji = catEmoji
                  }
                  .testTag("cat_chip_$catName")
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Text(text = catEmoji, fontSize = 16.sp)
                  Text(
                    text = catName,
                    style = MaterialTheme.typography.labelMedium.copy(
                      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                    ),
                    color = if (isSelected) Color.White else TextPrimary
                  )
                }
              }
            }
          }
        }
      }

      // Paid By Selector
      item {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Text(
              text = "Paid By",
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = TextPrimary
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              allMembers.forEach { member ->
                val isSelected = paidByMember.id == member.id
                Surface(
                  shape = RoundedCornerShape(12.dp),
                  color = if (isSelected) IndigoFixed else SurfaceContainer,
                  modifier = Modifier
                    .weight(1f)
                    .clickable { paidByMember = member }
                    .padding(vertical = 2.dp)
                ) {
                  Column(
                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                  ) {
                    AsyncImage(
                      model = member.avatarUrl,
                      contentDescription = member.name,
                      modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape),
                      contentScale = ContentScale.Crop
                    )
                    Text(
                      text = if (member.isCurrentUser) "You" else member.name.substringBefore(" "),
                      style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                      ),
                      color = if (isSelected) IndigoSecondary else TextPrimary,
                      maxLines = 1
                    )
                  }
                }
              }
            }
          }
        }
      }

      // Split Options & Flatmate Inclusion
      item {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Split Options",
                style = MaterialTheme.typography.headlineSmall.copy(
                  fontSize = 16.sp,
                  fontWeight = FontWeight.Bold
                ),
                color = TextPrimary
              )
              Row(
                modifier = Modifier
                  .clip(RoundedCornerShape(8.dp))
                  .background(SurfaceContainerHigh)
                  .padding(horizontal = 4.dp, vertical = 2.dp)
              ) {
                listOf("Equally", "Unequally", "By Shares").forEach { tab ->
                  val isSel = selectedSplitTab == tab
                  Box(
                    modifier = Modifier
                      .clip(RoundedCornerShape(6.dp))
                      .background(if (isSel) SurfaceContainerLowest else Color.Transparent)
                      .clickable { selectedSplitTab = tab }
                      .padding(horizontal = 8.dp, vertical = 4.dp)
                  ) {
                    Text(
                      text = tab,
                      style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal
                      ),
                      color = if (isSel) TextPrimary else TextSecondary
                    )
                  }
                }
              }
            }

            // Member list with checkboxes
            allMembers.forEach { member ->
              val isIncluded = includedMemberIds.contains(member.id)
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .clip(RoundedCornerShape(10.dp))
                  .clickable {
                    includedMemberIds = if (isIncluded) {
                      if (includedMemberIds.size > 1) includedMemberIds - member.id else includedMemberIds
                    } else {
                      includedMemberIds + member.id
                    }
                  }
                  .padding(vertical = 4.dp, horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Checkbox(
                    checked = isIncluded,
                    onCheckedChange = null,
                    colors = CheckboxDefaults.colors(checkedColor = EmeraldPrimary)
                  )
                  AsyncImage(
                    model = member.avatarUrl,
                    contentDescription = member.name,
                    modifier = Modifier
                      .size(32.dp)
                      .clip(CircleShape),
                    contentScale = ContentScale.Crop
                  )
                  Text(
                    text = member.name,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                    color = TextPrimary
                  )
                }

                Text(
                  text = if (isIncluded) "₹${String.format("%.2f", perPersonAmount)}" else "₹0.00",
                  style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                  color = if (isIncluded) TextPrimary else TextSecondary
                )
              }
            }
          }
        }
      }

      // Attach Bill / Receipt (AI OCR Simulation)
      item {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .clickable {
              if (attachedReceipt == null) {
                attachedReceipt = "receipt_grocery_scan.jpg"
                viewModel.showToast("Receipt scanned! Total extracted: ₹2,840", "auto_awesome")
              } else {
                attachedReceipt = null
                viewModel.showToast("Receipt removed")
              }
            }
            .testTag("attach_bill_card")
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.CameraAlt,
                  contentDescription = null,
                  tint = IndigoSecondary
                )
                Text(
                  text = "Attach Bill / Receipt",
                  style = MaterialTheme.typography.headlineSmall.copy(
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                  ),
                  color = TextPrimary
                )
              }

              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.AutoAwesome,
                  contentDescription = null,
                  tint = EmeraldPrimary,
                  modifier = Modifier.size(16.dp)
                )
                Text(
                  text = "TicketSplit OCR",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = EmeraldPrimary
                )
              }
            }

            if (attachedReceipt != null) {
              Surface(
                shape = RoundedCornerShape(10.dp),
                color = SurfaceContainerLow,
                modifier = Modifier.fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier.padding(10.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                  ) {
                    Icon(
                      imageVector = Icons.Default.ReceiptLong,
                      contentDescription = null,
                      tint = EmeraldPrimary
                    )
                    Column {
                      Text(
                        text = attachedReceipt ?: "",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = TextPrimary
                      )
                      Text(
                        text = "1.4 MB • Auto-matched total ₹2,840",
                        style = MaterialTheme.typography.bodySmall,
                        color = EmeraldPrimary
                      )
                    }
                  }
                  Text(
                    text = "Tap to Remove",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                  )
                }
              }
            } else {
              Text(
                text = "Tap to photograph grocery receipt or restaurant bill to auto-extract line items",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
              )
            }
          }
        }
      }
    }

    // Fixed Bottom Action Bar: Save & Split Expense
    Surface(
      color = SurfaceBg.copy(alpha = 0.95f),
      shadowElevation = 8.dp,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .fillMaxWidth()
    ) {
      Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Button(
          onClick = {
            if (parsedAmount <= 0) {
              viewModel.showToast("Please enter an amount greater than 0")
              return@Button
            }
            val title = descriptionInput.ifBlank { "$selectedCategory Expense" }
            viewModel.addExpense(
              groupId = group.id,
              title = title,
              amount = parsedAmount,
              paidBy = paidByMember,
              category = selectedCategory,
              categoryEmoji = selectedCategoryEmoji,
              includedIds = includedMemberIds,
              receiptName = attachedReceipt,
              receiptUrl = if (attachedReceipt != null) "https://receipts.ticketsplit.app/oct24" else null
            )
          },
          shape = RoundedCornerShape(14.dp),
          colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .testTag("save_and_split_button")
        ) {
          Text(
            text = "Save & Split Expense (₹${parsedAmount.toInt()})",
            style = MaterialTheme.typography.labelLarge.copy(
              fontWeight = FontWeight.Bold,
              fontSize = 16.sp
            ),
            color = Color.White
          )
        }

        Text(
          text = "Will notify 3 flatmates via WhatsApp & in-app push",
          style = MaterialTheme.typography.bodySmall,
          color = TextSecondary
        )
      }
    }
  }
}
