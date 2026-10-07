package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Expense
import com.example.ui.TicketSplitViewModel
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintOnPrimaryFixed
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.SurfaceBg
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHighest
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun ActivityFeedScreen(
  viewModel: TicketSplitViewModel,
  expenses: List<Expense>,
  modifier: Modifier = Modifier
) {
  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .background(SurfaceBg),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
  ) {
    item {
      Text(
        text = "Activity & History",
        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
        color = TextPrimary
      )
      Text(
        text = "Real-time ledger of splits, payments and settlements",
        style = MaterialTheme.typography.bodySmall,
        color = TextSecondary
      )
      Spacer(modifier = Modifier.height(4.dp))
    }

    items(expenses) { expense ->
      RecentExpenseItem(expense = expense)
    }
  }
}

@Composable
fun SettingsScreen(
  viewModel: TicketSplitViewModel,
  modifier: Modifier = Modifier
) {
  var autoSmsSync by remember { mutableStateOf(true) }
  var pushNotifications by remember { mutableStateOf(true) }
  var upiAutopayRent by remember { mutableStateOf(false) }

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .background(SurfaceBg),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    item {
      Text(
        text = "Settings & Preferences",
        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
        color = TextPrimary
      )
      Text(
        text = "Aarav Verma • aarav.verma@okhdfcbank",
        style = MaterialTheme.typography.bodySmall,
        color = TextSecondary
      )
    }

    item {
      Surface(
        shape = RoundedCornerShape(18.dp),
        color = SurfaceContainerLowest,
        shadowElevation = 1.dp,
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text(
            text = "Automation & AI Features",
            style = MaterialTheme.typography.headlineSmall.copy(
              fontSize = 16.sp,
              fontWeight = FontWeight.Bold
            ),
            color = TextPrimary
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "Auto-Parse UPI Bank SMS",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = TextPrimary
              )
              Text(
                text = "Automatically suggest expenses when you pay via UPI",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
              )
            }
            Switch(
              checked = autoSmsSync,
              onCheckedChange = {
                autoSmsSync = it
                viewModel.showToast(if (it) "SMS auto-parsing active" else "SMS auto-parsing disabled")
              },
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
                text = "Rent Auto-Pay Delegation",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = TextPrimary
              )
              Text(
                text = "One-click approval for landlord rent on 1st of month",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
              )
            }
            Switch(
              checked = upiAutopayRent,
              onCheckedChange = {
                upiAutopayRent = it
                viewModel.showToast(if (it) "Rent Autopay draft enabled" else "Rent Autopay disabled")
              },
              colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = EmeraldPrimary
              )
            )
          }
        }
      }
    }

    item {
      Surface(
        shape = RoundedCornerShape(18.dp),
        color = SurfaceContainerLowest,
        shadowElevation = 1.dp,
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text(
            text = "Payment Handles",
            style = MaterialTheme.typography.headlineSmall.copy(
              fontSize = 16.sp,
              fontWeight = FontWeight.Bold
            ),
            color = TextPrimary
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .clip(CircleShape)
                  .background(EmeraldPrimary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
              ) {
                Icon(Icons.Default.CreditCard, contentDescription = null, tint = EmeraldPrimary)
              }
              Column {
                Text(
                  text = "Primary UPI ID",
                  style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                  color = TextPrimary
                )
                Text(
                  text = "aarav.verma@okhdfcbank",
                  style = MaterialTheme.typography.bodySmall,
                  color = TextSecondary
                )
              }
            }

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = MintPrimaryFixed
            ) {
              Text(
                text = "DEFAULT",
                style = MaterialTheme.typography.labelSmall.copy(
                  fontWeight = FontWeight.Bold,
                  fontSize = 10.sp
                ),
                color = MintOnPrimaryFixed,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }
        }
      }
    }
  }
}
