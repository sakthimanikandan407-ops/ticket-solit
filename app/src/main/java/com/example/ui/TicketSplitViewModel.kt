package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.Group
import com.example.data.model.Member
import com.example.data.repository.TicketSplitRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class UiNotification(
  val message: String,
  val icon: String = "check_circle"
)

class TicketSplitViewModel(
  private val repository: TicketSplitRepository = TicketSplitRepository()
) : ViewModel() {

  val groups = repository.groups
  val expenses = repository.expenses
  val balances = repository.balances
  val settlementSteps = repository.settlementSteps

  private val _currentRoute = MutableStateFlow("groups")
  val currentRoute: StateFlow<String> = _currentRoute.asStateFlow()

  private val _selectedGroupId = MutableStateFlow("g1")
  val selectedGroupId: StateFlow<String> = _selectedGroupId.asStateFlow()

  private val _notificationFlow = MutableSharedFlow<UiNotification>()
  val notificationFlow: SharedFlow<UiNotification> = _notificationFlow.asSharedFlow()

  // Selected payee for settle modal / flow
  private val _settlePayee = MutableStateFlow(TicketSplitRepository.ROHAN)
  val settlePayee: StateFlow<Member> = _settlePayee.asStateFlow()

  private val _settleAmount = MutableStateFlow(2100.0)
  val settleAmount: StateFlow<Double> = _settleAmount.asStateFlow()

  // Quick Settle bottom sheet visibility
  private val _showSettleDrawer = MutableStateFlow(false)
  val showSettleDrawer: StateFlow<Boolean> = _showSettleDrawer.asStateFlow()

  fun navigateTo(route: String) {
    _currentRoute.value = route
  }

  fun selectGroup(groupId: String) {
    _selectedGroupId.value = groupId
    _currentRoute.value = "group_details"
  }

  fun openSettleFor(member: Member, amount: Double) {
    _settlePayee.value = member
    _settleAmount.value = amount
    _showSettleDrawer.value = true
  }

  fun openUpiFlowFor(member: Member, amount: Double) {
    _settlePayee.value = member
    _settleAmount.value = amount
    _showSettleDrawer.value = false
    _currentRoute.value = "upi_flow"
  }

  fun closeSettleDrawer() {
    _showSettleDrawer.value = false
  }

  fun showToast(message: String, icon: String = "check_circle") {
    viewModelScope.launch {
      _notificationFlow.emit(UiNotification(message, icon))
    }
  }

  fun toggleRentReminder(groupId: String) {
    val enabled = repository.toggleRentReminder(groupId)
    val msg = if (enabled) "Rent reminders set for 3 days before 1st" else "Rent reminders muted for this flat"
    showToast(msg, if (enabled) "notifications_active" else "notifications_off")
  }

  fun toggleRentAutomation(groupId: String) {
    repository.toggleRentAutomation(groupId)
    showToast("Rent payment auto-split updated")
  }

  fun toggleSmartDebt(groupId: String) {
    repository.toggleSmartDebt(groupId)
    showToast("Smart debt minimization updated")
  }

  fun addExpense(
    groupId: String,
    title: String,
    amount: Double,
    paidBy: Member,
    category: String,
    categoryEmoji: String,
    includedIds: Set<String>,
    receiptName: String?,
    receiptUrl: String?
  ) {
    repository.addExpense(
      groupId = groupId,
      title = title,
      amount = amount,
      paidByMember = paidBy,
      category = category,
      categoryEmoji = categoryEmoji,
      includedMemberIds = includedIds,
      receiptName = receiptName,
      receiptUrl = receiptUrl
    )
    showToast("Expense of ₹${amount.toInt()} saved and split!")
    _currentRoute.value = "group_details"
  }

  fun markSettled(utr: String? = null) {
    repository.settleMemberDebt(_settlePayee.value.id, utr)
    showToast("Settlement of ₹${_settleAmount.value.toInt()} marked complete!", "verified")
  }
}
