package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.example.ui.TicketSplitViewModel
import com.example.ui.components.TicketSplitBottomBar
import com.example.ui.components.TicketSplitTopBar
import com.example.ui.screens.ActivityFeedScreen
import com.example.ui.screens.AddExpenseScreen
import com.example.ui.screens.GroupDetailsScreen
import com.example.ui.screens.GroupsDashboardScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.UpiPaymentFlowScreen
import com.example.ui.theme.TicketSplitTheme
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {
  private val viewModel: TicketSplitViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      TicketSplitTheme {
        TicketSplitApp(viewModel = viewModel)
      }
    }
  }
}

@Composable
fun TicketSplitApp(
  viewModel: TicketSplitViewModel,
  modifier: Modifier = Modifier
) {
  val currentRoute by viewModel.currentRoute.collectAsState()
  val groups by viewModel.groups.collectAsState()
  val expenses by viewModel.expenses.collectAsState()
  val balances by viewModel.balances.collectAsState()
  val steps by viewModel.settlementSteps.collectAsState()
  val selectedGroupId by viewModel.selectedGroupId.collectAsState()
  val settlePayee by viewModel.settlePayee.collectAsState()
  val settleAmount by viewModel.settleAmount.collectAsState()

  val selectedGroup = groups.firstOrNull { it.id == selectedGroupId } ?: groups.first()
  val groupExpenses = expenses.filter { it.groupId == selectedGroup.id }

  val snackbarHostState = remember { SnackbarHostState() }

  LaunchedEffect(Unit) {
    viewModel.notificationFlow.collectLatest { notif ->
      snackbarHostState.showSnackbar(notif.message)
    }
  }

  val isTopLevel = currentRoute == "groups" || currentRoute == "activity" || currentRoute == "settings"

  Scaffold(
    topBar = {
      when (currentRoute) {
        "groups" -> TicketSplitTopBar(
          title = "TicketSplit",
          subtitle = "GROUPS",
          showBackButton = false,
          onNotificationsClick = { viewModel.showToast("No new unread flat notifications") },
          onProfileClick = { viewModel.navigateTo("settings") }
        )
        "group_details" -> TicketSplitTopBar(
          title = selectedGroup.name,
          subtitle = "FLAT EXPENSES & RENT",
          showBackButton = true,
          onBackClick = { viewModel.navigateTo("groups") },
          onNotificationsClick = { viewModel.showToast("Group alerts: Rent due in 4 days") },
          onProfileClick = { viewModel.navigateTo("settings") }
        )
        "add_expense" -> TicketSplitTopBar(
          title = "Add Expense",
          subtitle = selectedGroup.name.uppercase(),
          showBackButton = true,
          onBackClick = { viewModel.navigateTo("group_details") },
          onNotificationsClick = { viewModel.showToast("OCR receipt scanner ready") },
          onProfileClick = { viewModel.navigateTo("settings") }
        )
        "upi_flow" -> TicketSplitTopBar(
          title = "UPI Payment Flow",
          subtitle = "INSTANT SETTLEMENT",
          showBackButton = true,
          onBackClick = { viewModel.navigateTo("group_details") },
          onNotificationsClick = { viewModel.showToast("NPCI Settlement rail active") },
          onProfileClick = { viewModel.navigateTo("settings") }
        )
        "activity" -> TicketSplitTopBar(
          title = "Activity Feed",
          subtitle = "ALL GROUPS",
          showBackButton = false,
          onNotificationsClick = { viewModel.showToast("Activity history synced") },
          onProfileClick = { viewModel.navigateTo("settings") }
        )
        "settings" -> TicketSplitTopBar(
          title = "Settings",
          subtitle = "PREFERENCES",
          showBackButton = false,
          onNotificationsClick = { viewModel.showToast("Settings up to date") },
          onProfileClick = {}
        )
      }
    },
    bottomBar = {
      if (currentRoute != "add_expense" && currentRoute != "upi_flow") {
        TicketSplitBottomBar(
          currentRoute = currentRoute,
          onNavigate = { route ->
            if (route == "upi_flow") {
              viewModel.openUpiFlowFor(settlePayee, settleAmount)
            } else {
              viewModel.navigateTo(route)
            }
          }
        )
      }
    },
    snackbarHost = { SnackbarHost(snackbarHostState) },
    modifier = modifier.fillMaxSize()
  ) { innerPadding ->
    AnimatedContent(
      targetState = currentRoute,
      transitionSpec = { fadeIn() togetherWith fadeOut() },
      label = "screenTransition",
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) { route ->
      when (route) {
        "groups" -> GroupsDashboardScreen(
          viewModel = viewModel,
          groups = groups,
          expenses = expenses,
          onGroupClick = { gId -> viewModel.selectGroup(gId) },
          onAddExpenseClick = { viewModel.navigateTo("add_expense") },
          onSettleClick = {
            viewModel.openUpiFlowFor(settlePayee, 1200.0)
          }
        )
        "group_details" -> GroupDetailsScreen(
          viewModel = viewModel,
          group = selectedGroup,
          expenses = groupExpenses,
          balances = balances,
          onBackClick = { viewModel.navigateTo("groups") },
          onAddExpenseClick = { viewModel.navigateTo("add_expense") },
          onSettleClick = {
            viewModel.openUpiFlowFor(settlePayee, 2100.0)
          }
        )
        "add_expense" -> AddExpenseScreen(
          viewModel = viewModel,
          group = selectedGroup,
          onBackClick = { viewModel.navigateTo("group_details") }
        )
        "upi_flow" -> UpiPaymentFlowScreen(
          viewModel = viewModel,
          payee = settlePayee,
          amount = settleAmount,
          steps = steps,
          onBackClick = { viewModel.navigateTo("group_details") }
        )
        "activity" -> ActivityFeedScreen(
          viewModel = viewModel,
          expenses = expenses
        )
        "settings" -> SettingsScreen(
          viewModel = viewModel
        )
      }
    }
  }
}

