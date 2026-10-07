package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults.SecondaryIndicator
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.BalanceDebt
import com.example.data.model.Expense
import com.example.data.model.Group
import com.example.data.model.Member
import com.example.data.repository.TicketSplitRepository
import com.example.ui.TicketSplitViewModel
import com.example.ui.components.BhimLogo
import com.example.ui.components.GPayLogo
import com.example.ui.components.PaytmLogo
import com.example.ui.components.PhonePeLogo
import com.example.ui.components.copyToClipboard
import com.example.ui.components.launchUpiIntent
import com.example.ui.theme.EmeraldContainer
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.IndigoContainer
import com.example.ui.theme.IndigoFixed
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintOnPrimaryFixed
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.OnTertiaryFixed
import com.example.ui.theme.SurfaceBg
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHigh
import com.example.ui.theme.SurfaceContainerHighest
import com.example.ui.theme.SurfaceContainerLow
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TertiaryFixed
import com.example.ui.theme.TertiaryOrange
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GroupDetailsScreen(
  viewModel: TicketSplitViewModel,
  group: Group,
  expenses: List<Expense>,
  balances: List<BalanceDebt>,
  onBackClick: () -> Unit,
  onAddExpenseClick: () -> Unit,
  onSettleClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var selectedTabIndex by remember { mutableIntStateOf(0) }
  val tabs = listOf("Expenses (${expenses.size})", "Balances", "Flat Rules & Rent")

  val showSettleDrawer by viewModel.showSettleDrawer.collectAsState()
  val settlePayee by viewModel.settlePayee.collectAsState()
  val settleAmount by viewModel.settleAmount.collectAsState()
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  val scope = rememberCoroutineScope()

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .background(SurfaceBg),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      // 1. Group Identity & Header Card
      item {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("group_identity_card")
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Top
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
              ) {
                Box(
                  modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainerHigh),
                  contentAlignment = Alignment.Center
                ) {
                  Text(text = "🏠", fontSize = 24.sp)
                }
                Column {
                  Text(
                    text = group.name,
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimary
                  )
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(top = 2.dp)
                  ) {
                    Box(
                      modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(EmeraldPrimary)
                    )
                    Text(
                      text = group.location,
                      style = MaterialTheme.typography.bodySmall,
                      color = TextSecondary
                    )
                  }
                }
              }

              Button(
                onClick = {
                  copyToClipboard(context, "https://ticketsplit.app/join/greenglen402", "Group Invite")
                  viewModel.showToast("Invite link copied to clipboard!")
                },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                  containerColor = SurfaceContainer,
                  contentColor = IndigoSecondary
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.testTag("invite_button")
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                  )
                  Text(
                    text = "Invite",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                  )
                }
              }
            }

            // Flatmate Faces Bar
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(horizontalArrangement = Arrangement.spacedBy((-8).dp)) {
                group.members.forEach { member ->
                  Box(
                    modifier = Modifier
                      .size(32.dp)
                      .clip(CircleShape)
                      .border(2.dp, SurfaceContainerLowest, CircleShape)
                  ) {
                    AsyncImage(
                      model = member.avatarUrl,
                      contentDescription = member.name,
                      modifier = Modifier.fillMaxSize(),
                      contentScale = ContentScale.Crop
                    )
                  }
                }
              }
              Spacer(modifier = Modifier.width(12.dp))
              Surface(
                shape = RoundedCornerShape(16.dp),
                color = SurfaceContainer
              ) {
                Text(
                  text = "Rohan, Aarav (You), Priya, Nikhil",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                  color = TextSecondary,
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }
          }
        }
      }

      // 2. Recurring Rent Alert Banner
      item {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = Color.Transparent,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(
              Brush.horizontalGradient(
                colors = listOf(TertiaryFixed, SurfaceContainerLowest)
              )
            )
            .testTag("rent_alert_banner")
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Text(text = "⏰", fontSize = 18.sp)
                Text(
                  text = "Monthly Flat Rent",
                  style = MaterialTheme.typography.headlineSmall.copy(
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                  ),
                  color = OnTertiaryFixed
                )
              }

              Surface(
                shape = RoundedCornerShape(12.dp),
                color = SurfaceContainerLowest.copy(alpha = 0.85f)
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(6.dp)
                      .clip(CircleShape)
                      .background(EmeraldPrimary)
                  )
                  Text(
                    text = "Auto-Split Active",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = EmeraldPrimary
                  )
                }
              }
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Bottom
            ) {
              Text(
                text = "₹${group.monthlyRent.toInt()}",
                style = MaterialTheme.typography.displayMedium.copy(
                  fontWeight = FontWeight.ExtraBold,
                  fontSize = 28.sp
                ),
                color = TextPrimary
              )
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(6.dp))
                  .background(TertiaryFixed.copy(alpha = 0.7f))
                  .padding(horizontal = 8.dp, vertical = 2.dp)
              ) {
                Text(
                  text = "Due in ${group.nextRentDueDays} Days (${group.rentDueDateText})",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = TertiaryOrange
                )
              }
            }

            Text(
              text = "Each pays ₹${(group.monthlyRent / group.memberCount).toInt()} • Landlord UPI: ${group.landlordUpi}",
              style = MaterialTheme.typography.bodySmall,
              color = TextSecondary
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                modifier = Modifier
                  .clickable {
                    copyToClipboard(context, group.landlordUpi, "Landlord UPI")
                    viewModel.showToast("Copied Landlord UPI: ${group.landlordUpi}")
                  }
                  .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.ContentCopy,
                  contentDescription = null,
                  tint = IndigoSecondary,
                  modifier = Modifier.size(15.dp)
                )
                Text(
                  text = "Copy Landlord UPI",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                  color = IndigoSecondary
                )
              }

              Row(
                modifier = Modifier
                  .clickable { viewModel.toggleRentReminder(group.id) }
                  .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = if (group.remindersOn) Icons.Default.NotificationsActive else Icons.Default.NotificationsOff,
                  contentDescription = null,
                  tint = if (group.remindersOn) EmeraldPrimary else TextSecondary,
                  modifier = Modifier.size(15.dp)
                )
                Text(
                  text = if (group.remindersOn) "Reminders ON" else "Reminders OFF",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                  color = if (group.remindersOn) EmeraldPrimary else TextSecondary
                )
              }
            }
          }
        }
      }

      // 3. Group Net Summary Bento Card
      item {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("group_net_summary_card")
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Top
            ) {
              Column {
                Text(
                  text = "TOTAL SPEND (OCTOBER)",
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                  ),
                  color = TextSecondary
                )
                Text(
                  text = "₹${group.totalSpendMonth.toInt()}",
                  style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 28.sp
                  ),
                  color = TextPrimary
                )
              }

              Column(horizontalAlignment = Alignment.End) {
                Text(
                  text = "YOUR NET BALANCE",
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                  ),
                  color = TextSecondary
                )
                Text(
                  text = "+₹${group.netBalance.toInt()}",
                  style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 28.sp
                  ),
                  color = EmeraldPrimary
                )
              }
            }

            // Micro Breakdown Pill
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = SurfaceContainerLow,
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.AccountBalanceWallet,
                  contentDescription = null,
                  tint = EmeraldPrimary,
                  modifier = Modifier.size(18.dp)
                )
                Text(
                  text = "Rohan owes you ₹2,100 • Priya owes ₹1,300",
                  style = MaterialTheme.typography.bodySmall,
                  color = TextSecondary
                )
              }
            }

            // Action Button Cluster
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Button(
                onClick = { viewModel.openSettleFor(TicketSplitRepository.ROHAN, 2100.0) },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = IndigoSecondary),
                modifier = Modifier
                  .weight(1f)
                  .height(48.dp)
                  .testTag("button_settle_up_upi")
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.Bolt,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                  )
                  Text(
                    text = "Settle Up via UPI",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                  )
                }
              }

              Button(
                onClick = onAddExpenseClick,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                modifier = Modifier
                  .weight(1f)
                  .height(48.dp)
                  .testTag("button_add_expense_group")
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                  )
                  Text(
                    text = "Add Expense",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                  )
                }
              }
            }

            // Share Read-Only Summary link
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = SurfaceContainerLow,
              modifier = Modifier
                .fillMaxWidth()
                .clickable {
                  val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(
                      Intent.EXTRA_TEXT,
                      "Green Glen Flat 402 Expense Summary: Total spend ₹${group.totalSpendMonth.toInt()}, Rent ₹${group.monthlyRent.toInt()} due ${group.rentDueDateText}. View: https://ticketsplit.app/g/402"
                    )
                    type = "text/plain"
                  }
                  context.startActivity(Intent.createChooser(sendIntent, "Share Summary"))
                  viewModel.showToast("WhatsApp summary with view-only link created!")
                }
            ) {
              Row(
                modifier = Modifier.padding(vertical = 10.dp, horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
              ) {
                Icon(
                  imageVector = Icons.Default.Share,
                  contentDescription = null,
                  tint = EmeraldPrimary,
                  modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "Share Read-Only Summary (for Landlord / Guests)",
                  style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                  color = EmeraldPrimary
                )
              }
            }
          }
        }
      }

      // 4. Segmented Navigation Tabs
      item {
        Surface(
          shape = RoundedCornerShape(14.dp),
          color = SurfaceContainerHigh,
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(4.dp)
          ) {
            tabs.forEachIndexed { index, tabTitle ->
              val isSelected = selectedTabIndex == index
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(10.dp))
                  .background(if (isSelected) SurfaceContainerLowest else Color.Transparent)
                  .clickable { selectedTabIndex = index }
                  .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = tabTitle,
                  style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                  ),
                  color = if (isSelected) TextPrimary else TextSecondary
                )
              }
            }
          }
        }
      }

      // 5. Tab Content: Expenses
      if (selectedTabIndex == 0) {
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Recent Expenses",
              style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
              color = TextPrimary
            )
            Text(
              text = "Sorted by date",
              style = MaterialTheme.typography.labelSmall,
              color = TextSecondary
            )
          }
        }

        items(expenses) { exp ->
          GroupExpenseCardItem(
            expense = exp,
            onPayClick = { name, amt ->
              viewModel.openSettleFor(TicketSplitRepository.ROHAN, amt)
            }
          )
        }
      }

      // 6. Tab Content: Balances
      if (selectedTabIndex == 1) {
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Simplified Net Balances",
              style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
              color = TextPrimary
            )
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Default.AutoFixHigh,
                contentDescription = null,
                tint = EmeraldPrimary,
                modifier = Modifier.size(15.dp)
              )
              Text(
                text = "Smart Debt Reduced",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = EmeraldPrimary
              )
            }
          }
        }

        items(balances) { debt ->
          MemberBalanceCard(
            debt = debt,
            onRemindWhatsApp = {
              val url = "https://api.whatsapp.com/send?text=Hey%20${debt.member.name}!%20Please%20settle%20₹${debt.amountOwedToYou.toInt()}%20for%20Green%20Glen%20Flat%20402"
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              try { context.startActivity(intent) } catch (e: Exception) {}
              viewModel.showToast("WhatsApp reminder sent to ${debt.member.name}!")
            },
            onRequestUpi = {
              viewModel.openUpiFlowFor(debt.member, debt.amountOwedToYou)
            }
          )
        }
      }

      // 7. Tab Content: Flat Rules & Rent
      if (selectedTabIndex == 2) {
        item {
          Surface(
            shape = RoundedCornerShape(18.dp),
            color = SurfaceContainerLowest,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(
              modifier = Modifier.padding(16.dp),
              verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
              Text(
                text = "Flat Split Preferences",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                color = TextPrimary
              )

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "Rent Payment Automation",
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary
                  )
                  Text(
                    text = "Generate draft split 3 days before 1st",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                  )
                }
                Switch(
                  checked = group.rentPaymentAutomation,
                  onCheckedChange = { viewModel.toggleRentAutomation(group.id) },
                  colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = EmeraldPrimary
                  )
                )
              }

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "Smart Debt Minimization",
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary
                  )
                  Text(
                    text = "Combine cross-payments across 4 people",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                  )
                }
                Switch(
                  checked = group.smartDebtMinimization,
                  onCheckedChange = { viewModel.toggleSmartDebt(group.id) },
                  colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = EmeraldPrimary
                  )
                )
              }

              Surface(
                shape = RoundedCornerShape(10.dp),
                color = SurfaceContainerLow,
                modifier = Modifier.fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier.padding(12.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = "Flat Group UPI ID",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary
                  )
                  Text(
                    text = group.flatGroupUpiId,
                    style = MaterialTheme.typography.bodySmall.copy(
                      fontFamily = FontFamily.Monospace,
                      fontWeight = FontWeight.Bold
                    ),
                    color = IndigoSecondary
                  )
                }
              }
            }
          }
        }
      }
    }

    // Interactive Instant UPI Settlement Modal Bottom Sheet
    if (showSettleDrawer) {
      ModalBottomSheet(
        onDismissRequest = { viewModel.closeSettleDrawer() },
        sheetState = sheetState,
        containerColor = SurfaceContainerLowest,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(start = 20.dp, end = 20.dp, bottom = 32.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text(
                text = "Instant UPI Settlement",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = TextPrimary
              )
              Text(
                text = "Direct instant transfer via your favorite UPI app",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
              )
            }
            IconButton(onClick = { viewModel.closeSettleDrawer() }) {
              Icon(Icons.Default.Close, contentDescription = "Close")
            }
          }

          // Recipient & Amount Card
          Surface(
            shape = RoundedCornerShape(16.dp),
            color = SurfaceContainerLow,
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier.padding(16.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text(
                  text = "Select recipient",
                  style = MaterialTheme.typography.labelSmall,
                  color = TextSecondary
                )
                Text(
                  text = settlePayee.name,
                  style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                  color = TextPrimary
                )
                Text(
                  text = settlePayee.upiId,
                  style = MaterialTheme.typography.bodySmall,
                  color = TextSecondary
                )
              }

              Column(horizontalAlignment = Alignment.End) {
                Text(
                  text = "Amount",
                  style = MaterialTheme.typography.labelSmall,
                  color = TextSecondary
                )
                Text(
                  text = "₹${settleAmount.toInt()}",
                  style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 26.sp
                  ),
                  color = IndigoSecondary
                )
              }
            }
          }

          // UPI App Quick Tiles
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            listOf(
              Triple("GPay", "Google Pay", "com.google.android.apps.nbu.paisa.user"),
              Triple("पे", "PhonePe", "com.phonepe.app"),
              Triple("Paytm", "Paytm", "net.one97.paytm"),
              Triple("BHIM", "BHIM", "in.org.npci.upiapp")
            ).forEach { (shortCode, title, pkg) ->
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = SurfaceContainer,
                modifier = Modifier
                  .weight(1f)
                  .clickable {
                    launchUpiIntent(
                      context = context,
                      vpa = settlePayee.upiId,
                      name = settlePayee.name,
                      amount = settleAmount,
                      targetPackage = pkg
                    )
                    viewModel.showToast("Opening $title for secure UPI transfer...")
                    viewModel.closeSettleDrawer()
                  }
              ) {
                Column(
                  modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
                  horizontalAlignment = Alignment.CenterHorizontally,
                  verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(38.dp)
                      .clip(CircleShape)
                      .background(
                        when (shortCode) {
                          "पे" -> Color(0xFF5F259F)
                          "Paytm" -> Color(0xFF002E6E)
                          else -> Color.White
                        }
                      ),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = shortCode,
                      color = if (shortCode == "पे") Color.White else if (shortCode == "Paytm") Color(0xFF00B9F5) else Color(0xFF1A73E8),
                      fontWeight = FontWeight.Bold,
                      fontSize = 11.sp
                    )
                  }
                  Text(
                    text = title,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = TextPrimary,
                    maxLines = 1
                  )
                }
              }
            }
          }

          // Trigger Main Action Button
          Button(
            onClick = {
              launchUpiIntent(
                context = context,
                vpa = settlePayee.upiId,
                name = settlePayee.name,
                amount = settleAmount
              )
              viewModel.showToast("Launching default UPI app...")
              viewModel.closeSettleDrawer()
            },
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = IndigoSecondary),
            modifier = Modifier
              .fillMaxWidth()
              .height(52.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Icon(Icons.Default.VerifiedUser, contentDescription = null)
              Text(
                text = "Launch Default UPI App",
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
              )
            }
          }

          Text(
            text = "Zero transaction fee • Instant flatmate balance sync",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            modifier = Modifier.align(Alignment.CenterHorizontally)
          )
        }
      }
    }
  }
}

@Composable
fun GroupExpenseCardItem(
  expense: Expense,
  onPayClick: (String, Double) -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(16.dp),
    color = SurfaceContainerLowest,
    shadowElevation = 1.dp,
    modifier = modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier.padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier.weight(1f)
        ) {
          Box(
            modifier = Modifier
              .size(42.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(
                when (expense.category) {
                  "Utilities" -> IndigoFixed
                  "Rent" -> TertiaryFixed
                  else -> SurfaceContainerHigh
                }
              ),
            contentAlignment = Alignment.Center
          ) {
            val icon = when (expense.category) {
              "Utilities" -> Icons.Default.Wifi
              "Rent" -> Icons.Default.CleaningServices
              "Groceries" -> Icons.Default.ShoppingBag
              else -> Icons.Default.Apartment
            }
            Icon(
              imageVector = icon,
              contentDescription = null,
              tint = when (expense.category) {
                "Utilities" -> IndigoSecondary
                "Rent" -> TertiaryOrange
                else -> TextPrimary
              },
              modifier = Modifier.size(20.dp)
            )
          }

          Column {
            Text(
              text = expense.title,
              style = MaterialTheme.typography.headlineSmall.copy(
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
              ),
              color = TextPrimary
            )
            Text(
              text = expense.splitSummary,
              style = MaterialTheme.typography.bodySmall,
              color = TextSecondary
            )
          }
        }

        Column(horizontalAlignment = Alignment.End) {
          Text(
            text = "₹${expense.totalAmount.toInt()}",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
          )
          if (expense.youGetBackAmount > 0) {
            Text(
              text = "You get ₹${String.format("%.2f", expense.youGetBackAmount)}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = EmeraldPrimary
            )
          } else if (expense.youOweAmount > 0) {
            Text(
              text = "You owe ₹${String.format("%.2f", expense.youOweAmount)}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = ErrorRed
            )
          }
        }
      }

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = expense.dateText,
          style = MaterialTheme.typography.bodySmall,
          color = TextSecondary
        )

        if (expense.settledText != null) {
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = MintPrimaryFixed
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = MintOnPrimaryFixed,
                modifier = Modifier.size(12.dp)
              )
              Text(
                text = expense.settledText,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = MintOnPrimaryFixed
              )
            }
          }
        } else if (expense.youOweAmount > 0) {
          Surface(
            shape = RoundedCornerShape(14.dp),
            color = IndigoFixed,
            modifier = Modifier.clickable {
              onPayClick(expense.paidByName, expense.youOweAmount)
            }
          ) {
            Text(
              text = "Pay ₹${String.format("%.2f", expense.youOweAmount)}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = IndigoSecondary,
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
            )
          }
        } else if (expense.receiptName != null) {
          Text(
            text = expense.receiptName,
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary
          )
        }
      }
    }
  }
}

@Composable
fun MemberBalanceCard(
  debt: BalanceDebt,
  onRemindWhatsApp: () -> Unit,
  onRequestUpi: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(16.dp),
    color = SurfaceContainerLowest,
    shadowElevation = 1.dp,
    modifier = modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier.padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          AsyncImage(
            model = debt.member.avatarUrl,
            contentDescription = debt.member.name,
            modifier = Modifier
              .size(40.dp)
              .clip(CircleShape),
            contentScale = ContentScale.Crop
          )
          Column {
            Text(
              text = debt.member.name.substringBefore(" "),
              style = MaterialTheme.typography.headlineSmall.copy(
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
              ),
              color = TextPrimary
            )
            Text(
              text = if (debt.isSettled) "All Settled Up" else "UPI: ${debt.member.upiId}",
              style = MaterialTheme.typography.bodySmall,
              color = TextSecondary
            )
          }
        }

        if (debt.isSettled) {
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = SurfaceContainer
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Default.DoneAll,
                contentDescription = null,
                tint = TextSecondary,
                modifier = Modifier.size(14.dp)
              )
              Text(
                text = "Settled (₹0)",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                color = TextSecondary
              )
            }
          }
        } else {
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = MintPrimaryFixed
          ) {
            Text(
              text = "Owes You ₹${debt.amountOwedToYou.toInt()}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = MintOnPrimaryFixed,
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
            )
          }
        }
      }

      if (!debt.isSettled) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = SurfaceContainerLow,
            modifier = Modifier
              .weight(1f)
              .clickable(onClick = onRemindWhatsApp)
          ) {
            Row(
              modifier = Modifier.padding(vertical = 8.dp, horizontal = 10.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = null,
                tint = EmeraldPrimary,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "Remind on WhatsApp",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = EmeraldPrimary
              )
            }
          }

          Button(
            onClick = onRequestUpi,
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = IndigoSecondary),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Payments,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
              )
              Text(
                text = "Request UPI",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
              )
            }
          }
        }
      }
    }
  }
}
