package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.Member
import com.example.data.model.SettlementTrackingStep
import com.example.data.model.StepStatus
import com.example.ui.TicketSplitViewModel
import com.example.ui.components.BhimLogo
import com.example.ui.components.DynamicQrCodeView
import com.example.ui.components.GPayLogo
import com.example.ui.components.PaytmLogo
import com.example.ui.components.PhonePeLogo
import com.example.ui.components.UpiAppListItem
import com.example.ui.components.copyToClipboard
import com.example.ui.components.launchUpiIntent
import com.example.ui.theme.EmeraldContainer
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.IndigoFixed
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintOnPrimaryFixed
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.SurfaceBg
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHigh
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TertiaryOrange
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun UpiPaymentFlowScreen(
  viewModel: TicketSplitViewModel,
  payee: Member,
  amount: Double,
  steps: List<SettlementTrackingStep>,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var showUtrDialog by remember { mutableStateOf(false) }
  var utrInput by remember { mutableStateOf("429188201945") }
  var selectedTab by remember { mutableIntStateOf(0) } // 0: App Intent, 1: QR Code

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .background(SurfaceBg),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 100.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Settlement Summary Hero Card
      item {
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("upi_settlement_hero_card")
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Top
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
              ) {
                AsyncImage(
                  model = payee.avatarUrl,
                  contentDescription = payee.name,
                  modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .border(2.dp, IndigoSecondary.copy(alpha = 0.3f), CircleShape),
                  contentScale = ContentScale.Crop
                )
                Column {
                  Text(
                    text = payee.name,
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimary
                  )
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.clickable {
                      copyToClipboard(context, payee.upiId, "UPI VPA")
                      viewModel.showToast("UPI VPA copied!")
                    }
                  ) {
                    Text(
                      text = payee.upiId,
                      style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold
                      ),
                      color = IndigoSecondary
                    )
                    Icon(
                      imageVector = Icons.Default.ContentCopy,
                      contentDescription = "Copy",
                      tint = IndigoSecondary,
                      modifier = Modifier.size(14.dp)
                    )
                  }
                }
              }

              Surface(
                shape = RoundedCornerShape(12.dp),
                color = MintPrimaryFixed
              ) {
                Text(
                  text = "VERIFIED UPI",
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp
                  ),
                  color = MintOnPrimaryFixed,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }
            }

            // Big Rupee Display
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Bottom
            ) {
              Column {
                Text(
                  text = "AMOUNT TO SETTLE",
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                  ),
                  color = TextSecondary
                )
                Text(
                  text = "₹${amount.toInt()}",
                  style = MaterialTheme.typography.displayLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 36.sp
                  ),
                  color = TextPrimary
                )
              }
              Text(
                text = "Flat 402 • Dues cleared",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary
              )
            }
          }
        }
      }

      // 2. Live Settlement Status Tracker
      item {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = SurfaceContainerLowest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("settlement_status_tracker")
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Settlement Status",
                style = MaterialTheme.typography.headlineSmall.copy(
                  fontSize = 16.sp,
                  fontWeight = FontWeight.Bold
                ),
                color = TextPrimary
              )
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.Security,
                  contentDescription = null,
                  tint = EmeraldPrimary,
                  modifier = Modifier.size(14.dp)
                )
                Text(
                  text = "NPCI Instant Rail",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                  color = EmeraldPrimary
                )
              }
            }

            // Steps
            steps.forEachIndexed { index, step ->
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top
              ) {
                // Step icon
                Box(
                  modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(
                      when (step.status) {
                        StepStatus.COMPLETED -> MintPrimaryFixed
                        StepStatus.IN_PROGRESS -> IndigoFixed
                        StepStatus.PENDING -> SurfaceContainer
                      }
                    ),
                  contentAlignment = Alignment.Center
                ) {
                  when (step.status) {
                    StepStatus.COMPLETED -> Icon(
                      imageVector = Icons.Default.Check,
                      contentDescription = null,
                      tint = MintOnPrimaryFixed,
                      modifier = Modifier.size(16.dp)
                    )
                    StepStatus.IN_PROGRESS -> CircularProgressIndicator(
                      color = IndigoSecondary,
                      strokeWidth = 2.5.dp,
                      modifier = Modifier.size(14.dp)
                    )
                    StepStatus.PENDING -> Icon(
                      imageVector = Icons.Default.RadioButtonUnchecked,
                      contentDescription = null,
                      tint = TextSecondary,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                }

                Column(modifier = Modifier.weight(1f)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(
                      text = step.title,
                      style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                      color = TextPrimary
                    )
                    Text(
                      text = step.timeOrBadge,
                      style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                      color = if (step.status == StepStatus.IN_PROGRESS) TertiaryOrange else TextSecondary
                    )
                  }
                  Text(
                    text = step.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                  )
                  if (index < steps.size - 1) {
                    Spacer(modifier = Modifier.height(8.dp))
                  }
                }
              }
            }
          }
        }
      }

      // 3. Payment Method Switcher Tabs
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
            listOf("Direct UPI App", "Dynamic QR Code").forEachIndexed { idx, title ->
              val isSel = selectedTab == idx
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(10.dp))
                  .background(if (isSel) SurfaceContainerLowest else Color.Transparent)
                  .clickable { selectedTab = idx }
                  .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = title,
                  style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium
                  ),
                  color = if (isSel) TextPrimary else TextSecondary
                )
              }
            }
          }
        }
      }

      // 4. Tab 0: Direct UPI Apps List
      if (selectedTab == 0) {
        item {
          Text(
            text = "Select UPI App on this device",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
          )
        }

        item {
          UpiAppListItem(
            appName = "Google Pay (GPay)",
            subtitle = "Fast UPI handshake • Recommended",
            badgeText = "Fastest",
            logoContent = { GPayLogo() },
            onClick = {
              launchUpiIntent(
                context = context,
                vpa = payee.upiId,
                name = payee.name,
                amount = amount,
                targetPackage = "com.google.android.apps.nbu.paisa.user"
              )
              viewModel.showToast("Opening Google Pay for ₹${amount.toInt()}...")
            }
          )
        }

        item {
          UpiAppListItem(
            appName = "PhonePe",
            subtitle = "Zero processing delay",
            logoContent = { PhonePeLogo() },
            onClick = {
              launchUpiIntent(
                context = context,
                vpa = payee.upiId,
                name = payee.name,
                amount = amount,
                targetPackage = "com.phonepe.app"
              )
              viewModel.showToast("Opening PhonePe for ₹${amount.toInt()}...")
            }
          )
        }

        item {
          UpiAppListItem(
            appName = "Paytm UPI",
            subtitle = "Instant bank to bank transfer",
            logoContent = { PaytmLogo() },
            onClick = {
              launchUpiIntent(
                context = context,
                vpa = payee.upiId,
                name = payee.name,
                amount = amount,
                targetPackage = "net.one97.paytm"
              )
              viewModel.showToast("Opening Paytm for ₹${amount.toInt()}...")
            }
          )
        }

        item {
          UpiAppListItem(
            appName = "BHIM / Any Other UPI",
            subtitle = "System app chooser fallback",
            logoContent = { BhimLogo() },
            onClick = {
              launchUpiIntent(
                context = context,
                vpa = payee.upiId,
                name = payee.name,
                amount = amount
              )
              viewModel.showToast("Opening UPI selector...")
            }
          )
        }
      }

      // 5. Tab 1: Dynamic QR Code
      if (selectedTab == 1) {
        item {
          DynamicQrCodeView(amount = amount, vpa = payee.upiId)
        }
      }

      // 6. Manual UTR confirmation option
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.Center
        ) {
          TextButton(onClick = { showUtrDialog = true }) {
            Text(
              text = "Already paid via desktop or external app? Enter UTR / Ref",
              style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
              color = IndigoSecondary
            )
          }
        }
      }
    }

    // Fixed Bottom Action Bar: Launch Default UPI App
    Surface(
      color = SurfaceBg.copy(alpha = 0.95f),
      shadowElevation = 8.dp,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .fillMaxWidth()
    ) {
      Row(
        modifier = Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        OutlinedButton(
          onClick = { showUtrDialog = true },
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.height(50.dp)
        ) {
          Text("I Have Paid")
        }

        Button(
          onClick = {
            launchUpiIntent(
              context = context,
              vpa = payee.upiId,
              name = payee.name,
              amount = amount
            )
            viewModel.showToast("Dispatched UPI intent to device...")
          },
          shape = RoundedCornerShape(12.dp),
          colors = ButtonDefaults.buttonColors(containerColor = IndigoSecondary),
          modifier = Modifier
            .weight(1f)
            .height(50.dp)
            .testTag("launch_upi_payment_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            Text(
              text = "Launch UPI Payment",
              style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
            )
          }
        }
      }
    }

    // Manual UTR Confirmation Dialog
    if (showUtrDialog) {
      AlertDialog(
        onDismissRequest = { showUtrDialog = false },
        title = {
          Text(
            text = "Confirm UPI Settlement",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
          )
        },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
              text = "Enter 12-digit UTR or Bank Reference ID from your UPI app receipt to instantly zero the balance:",
              style = MaterialTheme.typography.bodyMedium,
              color = TextSecondary
            )
            OutlinedTextField(
              value = utrInput,
              onValueChange = { utrInput = it },
              label = { Text("UPI Reference / UTR") },
              singleLine = true,
              modifier = Modifier.fillMaxWidth()
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              viewModel.markSettled(utrInput)
              showUtrDialog = false
              onBackClick()
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
          ) {
            Text("Mark As Settled")
          }
        },
        dismissButton = {
          TextButton(onClick = { showUtrDialog = false }) {
            Text("Cancel")
          }
        }
      )
    }
  }
}
