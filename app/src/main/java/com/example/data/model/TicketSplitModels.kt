package com.example.data.model

data class Member(
  val id: String,
  val name: String,
  val initials: String,
  val avatarUrl: String,
  val upiId: String,
  val isCurrentUser: Boolean = false,
  val defaultSharePercent: Double = 25.0
)

data class Group(
  val id: String,
  val name: String,
  val location: String,
  val memberCount: Int,
  val members: List<Member>,
  val netBalance: Double, // positive = you get back, negative = you owe
  val totalSpendMonth: Double = 48600.0,
  val nextRentDueDays: Int = 4,
  val monthlyRent: Double = 32000.0,
  val rentDueDateText: String = "1st Nov",
  val landlordUpi: String = "suresh.sharma@okaxis",
  val isAutoSplitRentActive: Boolean = true,
  val remindersOn: Boolean = true,
  val imageUrl: String,
  val lastPaidSummary: String? = null,
  val isSettled: Boolean = false,
  val flatGroupUpiId: String = "greenglen402@axisbank",
  val rentPaymentAutomation: Boolean = true,
  val smartDebtMinimization: Boolean = true
)

data class Expense(
  val id: String,
  val groupId: String,
  val title: String,
  val totalAmount: Double,
  val paidByName: String,
  val paidByMemberId: String,
  val splitSummary: String,
  val dateText: String,
  val category: String, // "Groceries", "Rent", "Utilities", "Food & Drinks", "Travel", "Fun"
  val categoryEmoji: String,
  val youGetBackAmount: Double = 0.0,
  val youOweAmount: Double = 0.0,
  val settledText: String? = null,
  val receiptName: String? = null,
  val receiptUrl: String? = null,
  val receiptSizeText: String? = null
)

data class BalanceDebt(
  val member: Member,
  val amountOwedToYou: Double,
  val isSettled: Boolean = false
)

enum class StepStatus {
  COMPLETED,
  IN_PROGRESS,
  PENDING
}

data class SettlementTrackingStep(
  val title: String,
  val timeOrBadge: String,
  val description: String,
  val status: StepStatus
)
