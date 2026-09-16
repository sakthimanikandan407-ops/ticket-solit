package com.example.data.repository

import com.example.data.model.BalanceDebt
import com.example.data.model.Expense
import com.example.data.model.Group
import com.example.data.model.Member
import com.example.data.model.SettlementTrackingStep
import com.example.data.model.StepStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class TicketSplitRepository {

  companion object {
    val CURRENT_USER = Member(
      id = "m1",
      name = "Aarav (You)",
      initials = "AY",
      avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAhBxa45kkyWRfmdWnfXUtTY7fywxuoNbzJUf-ZQ00iHCn2jRefgEWJhywhbS8AiklD4brUKrZgGi6ZmCK9t2B33s3oK6zRfoMWbn5aebAdxCG9vq_R1kxN6Pp1Fn1Gi4l2u3kaFeOM4C4gUbEFe2iiyaERB4u9TYT_iB-85TI556ETmS53mPWNgS02COreTQ5sk8IFxGDvWvls5v_vUcoqpZJoFtP18_PYY6m9x-khy7WnfhF7hDamhA",
      upiId = "aarav.verma@okhdfcbank",
      isCurrentUser = true
    )

    val ROHAN = Member(
      id = "m2",
      name = "Rohan Sharma",
      initials = "RS",
      avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCMehZ8lQ1dvms8kgr0UGK5mx-jbkRaL_LIUdik2yhuJj4mIofRM3s3gna_RDHh7CR52tCuRFyDvwIVNjE3YDvcL3-2cajhtkoAyWfp2PdhRx5xS1BcXnzjiHIidq8BHfc50-61OOxFmX9X7-hhOQb2RMPaasnK-7K8hHzMFn-hYJL3uvW6cpd5MsoW3Lqoc_lqDqdFtXBnw-P4hRsSsoL1q5nGErc_sfpzoijD7WglX8WZbzPRMYpptg",
      upiId = "rohan.sharma@paytm"
    )

    val PRIYA = Member(
      id = "m3",
      name = "Priya Nair",
      initials = "PN",
      avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCvmg-nEM9mERF0Iv0cH4b0B0gFA4IUnkYxFpU9SdPq00qGC_6L6YpIseTJOrYbgXSJ2DAmvyYuUY8ED9QlpC1DKLePw_vS9SZF8XISYMnwGnHdwOyENc0xv_VvjTuUlubyU66zvrnOcdX5cNbsgH7-UXgdut257Z1jX4mc6ZWy2_omdEULtx2mt_lmxeNZjOu3Wu7VTdhOx8E6vQuCEmHlZE7Ys7__KCu4ykoanjmgeDZxpV_s2pbJLQ",
      upiId = "priya.v@okaxis"
    )

    val NIKHIL = Member(
      id = "m4",
      name = "Nikhil Verma",
      initials = "NV",
      avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBizst3FavJcJ77P7f4VquXZn3vDwikR4-dfY5QomUTtzJuKW-vqDcMSwH108VbQvX1ebt06IX9qzdN1Ukl5FGsjoMqOVu0nM7IKEJEJlYA0epVbuPdD2wX2MIu1JBxI5qPYzGiIbJMK1nQgzOC2kZ9qy6eMgsVKmYN9tsoSz9T9azq6csEalB0aEHD0BKe2Eik4NR4xzXW53uIrKCS7yS8-IVgist8JfuWvIyrABozTPdFij7feFPEcQ",
      upiId = "nikhil.v@ybl"
    )
  }

  private val _groups = MutableStateFlow<List<Group>>(
    listOf(
      Group(
        id = "g1",
        name = "Green Glen Flat 402",
        location = "HSR Layout, Sector 2 • 4 Flatmates",
        memberCount = 4,
        members = listOf(CURRENT_USER, ROHAN, PRIYA, NIKHIL),
        netBalance = 3400.0,
        totalSpendMonth = 48600.0,
        nextRentDueDays = 4,
        monthlyRent = 32000.0,
        rentDueDateText = "1st Nov",
        landlordUpi = "suresh.sharma@okaxis",
        isAutoSplitRentActive = true,
        remindersOn = true,
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAqxEWAtCfLt8S8gQahXWdilcfB9GW3VF3K8nOcpKJHZ3bbHRFUtQPl4CA5nulX1YlGfjaabWsShpMIWAAem9GJR_uon8NAXJflS0wRzwWHMD-SJ6M2Mb0S5PqQfSMTAB-_tsZ68ZqEvuj2s4uMoJnl1d7v5Wnrrn-OKxnDd1YQoXHSCXuHQyDqlkreKCpRetBBfkfvbzcBBI3ObxDBYSB8pmAaDvKJ_csbjXZJ-KTOjLYjL25BAgUQCQ"
      ),
      Group(
        id = "g2",
        name = "Goa Roadtrip Nov 🏖️",
        location = "North Goa Trip • 5 members",
        memberCount = 5,
        members = listOf(CURRENT_USER, ROHAN),
        netBalance = -1200.0,
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCn-3jsT9LfsNYKpIlJTCZNAG1XuD1GQUJHLqrW27GEZrUlo_DPZVlUTrx0IqUaUe8uldQsRt8nQlUBJK9tU6wIP3Rg2wLnZDu1bduNxi0KaNjCbK64Rjlr2QWWSOGIMEwjjCGYTnR9C2zVu2-dW3aUdUtNFEgHHF1rt8epIW_CXQ4cGVZw96qRn4WU56j6OlRU2yV9Vd4EOr3mFghSqEzS1ytrXcUK-pDDQMJbnFBKhRLmN_AwljoPdA",
        lastPaidSummary = "Last paid: Thalassa Dinner by Rohan"
      ),
      Group(
        id = "g3",
        name = "Chai & Snacks (Office)",
        location = "Daily tapri runs • 6 colleagues",
        memberCount = 6,
        members = listOf(CURRENT_USER),
        netBalance = 0.0,
        isSettled = true,
        imageUrl = ""
      ),
      Group(
        id = "g4",
        name = "Cult.fit Annual Pass Split",
        location = "Annual gym combo • 2 members",
        memberCount = 2,
        members = listOf(CURRENT_USER),
        netBalance = 1450.0,
        imageUrl = ""
      )
    )
  )
  val groups: StateFlow<List<Group>> = _groups.asStateFlow()

  private val _expenses = MutableStateFlow<List<Expense>>(
    listOf(
      Expense(
        id = "e1",
        groupId = "g1",
        title = "October Broadband (Airtel Xstream)",
        totalAmount = 1499.0,
        paidByName = "Aarav (You)",
        paidByMemberId = "m1",
        splitSummary = "Paid by Aarav (You) • Split 4 ways",
        dateText = "Oct 24 • Fast 300 Mbps bill",
        category = "Utilities",
        categoryEmoji = "⚡",
        youGetBackAmount = 1124.25,
        settledText = "Settled by 2/4"
      ),
      Expense(
        id = "e2",
        groupId = "g1",
        title = "Maid & Cook Salary",
        totalAmount = 12000.0,
        paidByName = "Rohan",
        paidByMemberId = "m2",
        splitSummary = "Paid by Rohan • Split equally",
        dateText = "Oct 20 • Sunita Di (Cooking + Cleaning)",
        category = "Rent",
        categoryEmoji = "🏠",
        youOweAmount = 3000.0
      ),
      Expense(
        id = "e3",
        groupId = "g1",
        title = "Water Cans & Groceries (Blinkit)",
        totalAmount = 850.0,
        paidByName = "Priya",
        paidByMemberId = "m3",
        splitSummary = "Paid by Priya • Split equally",
        dateText = "Oct 18 • 2 Bisleri cans + dishwash",
        category = "Groceries",
        categoryEmoji = "🛒",
        youOweAmount = 212.50
      ),
      Expense(
        id = "e4",
        groupId = "g1",
        title = "Society Maintenance",
        totalAmount = 4200.0,
        paidByName = "Aarav (You)",
        paidByMemberId = "m1",
        splitSummary = "Paid by Aarav (You) • Split 4 ways",
        dateText = "Oct 05 • Lift, DG & Security Fund",
        category = "Utilities",
        categoryEmoji = "⚡",
        youGetBackAmount = 3150.0,
        receiptName = "Full receipt attached"
      ),
      Expense(
        id = "e5",
        groupId = "g1",
        title = "Swiggy Dinner",
        totalAmount = 1250.0,
        paidByName = "Aarav (You)",
        paidByMemberId = "m1",
        splitSummary = "You paid ₹1,250 • split 3 ways",
        dateText = "Today, 9:20 PM",
        category = "Food & Drinks",
        categoryEmoji = "🍕",
        youGetBackAmount = 833.33
      ),
      Expense(
        id = "e6",
        groupId = "g2",
        title = "Shell Fuel Station",
        totalAmount = 3600.0,
        paidByName = "Aarav",
        paidByMemberId = "m1",
        splitSummary = "Aarav paid ₹3,600 • Goa Trip",
        dateText = "Yesterday",
        category = "Travel",
        categoryEmoji = "🚕",
        youOweAmount = 720.00
      ),
      Expense(
        id = "e7",
        groupId = "g1",
        title = "Blinkit Grocery Restock",
        totalAmount = 940.0,
        paidByName = "Priya",
        paidByMemberId = "m3",
        splitSummary = "Priya paid ₹940 • Flat 402",
        dateText = "2 Nov",
        category = "Groceries",
        categoryEmoji = "🛒",
        youOweAmount = 235.00
      )
    )
  )
  val expenses: StateFlow<List<Expense>> = _expenses.asStateFlow()

  private val _balances = MutableStateFlow<List<BalanceDebt>>(
    listOf(
      BalanceDebt(member = ROHAN, amountOwedToYou = 2100.0, isSettled = false),
      BalanceDebt(member = PRIYA, amountOwedToYou = 1300.0, isSettled = false),
      BalanceDebt(member = NIKHIL, amountOwedToYou = 0.0, isSettled = true)
    )
  )
  val balances: StateFlow<List<BalanceDebt>> = _balances.asStateFlow()

  private val _settlementSteps = MutableStateFlow<List<SettlementTrackingStep>>(
    listOf(
      SettlementTrackingStep(
        title = "UPI Intent Dispatched",
        timeOrBadge = "11:42 AM",
        description = "Deep link handshake initiated from Rohan's device",
        status = StepStatus.COMPLETED
      ),
      SettlementTrackingStep(
        title = "Payment in Progress",
        timeOrBadge = "Awaiting Bank",
        description = "NPCI & receiving bank acknowledgement pending",
        status = StepStatus.IN_PROGRESS
      ),
      SettlementTrackingStep(
        title = "Settled & Recorded in Group",
        timeOrBadge = "Pending",
        description = "Balances will instantly zero out for Flat 402",
        status = StepStatus.PENDING
      )
    )
  )
  val settlementSteps: StateFlow<List<SettlementTrackingStep>> = _settlementSteps.asStateFlow()

  fun toggleRentReminder(groupId: String): Boolean {
    var newState = false
    _groups.update { list ->
      list.map { g ->
        if (g.id == groupId) {
          newState = !g.remindersOn
          g.copy(remindersOn = newState)
        } else g
      }
    }
    return newState
  }

  fun toggleRentAutomation(groupId: String) {
    _groups.update { list ->
      list.map { g ->
        if (g.id == groupId) g.copy(rentPaymentAutomation = !g.rentPaymentAutomation) else g
      }
    }
  }

  fun toggleSmartDebt(groupId: String) {
    _groups.update { list ->
      list.map { g ->
        if (g.id == groupId) g.copy(smartDebtMinimization = !g.smartDebtMinimization) else g
      }
    }
  }

  fun addExpense(
    groupId: String,
    title: String,
    amount: Double,
    paidByMember: Member,
    category: String,
    categoryEmoji: String,
    includedMemberIds: Set<String>,
    receiptName: String? = null,
    receiptUrl: String? = null
  ) {
    val count = includedMemberIds.size.coerceAtLeast(1)
    val perPerson = amount / count
    val youIncluded = includedMemberIds.contains(CURRENT_USER.id)
    val youPaid = paidByMember.isCurrentUser

    val youGetBack = if (youPaid) {
      if (youIncluded) amount - perPerson else amount
    } else 0.0

    val youOwe = if (!youPaid && youIncluded) perPerson else 0.0

    val newExpense = Expense(
      id = "e_${System.currentTimeMillis()}",
      groupId = groupId,
      title = title,
      totalAmount = amount,
      paidByName = if (paidByMember.isCurrentUser) "Aarav (You)" else paidByMember.name,
      paidByMemberId = paidByMember.id,
      splitSummary = "Paid by ${if (paidByMember.isCurrentUser) "Aarav (You)" else paidByMember.name} • Split ${count} ways",
      dateText = "Just now",
      category = category,
      categoryEmoji = categoryEmoji,
      youGetBackAmount = youGetBack,
      youOweAmount = youOwe,
      settledText = "Pending",
      receiptName = receiptName,
      receiptUrl = receiptUrl,
      receiptSizeText = if (receiptUrl != null) "1.4 MB • Auto-matched total" else null
    )

    _expenses.update { listOf(newExpense) + it }

    // Update group balance
    _groups.update { list ->
      list.map { g ->
        if (g.id == groupId) {
          val netDelta = youGetBack - youOwe
          g.copy(
            netBalance = g.netBalance + netDelta,
            totalSpendMonth = g.totalSpendMonth + amount
          )
        } else g
      }
    }
  }

  fun settleMemberDebt(memberId: String, utrOrRef: String? = null) {
    _balances.update { list ->
      list.map { b ->
        if (b.member.id == memberId) {
          b.copy(amountOwedToYou = 0.0, isSettled = true)
        } else b
      }
    }

    _settlementSteps.update { list ->
      list.map { step ->
        step.copy(status = StepStatus.COMPLETED)
      }
    }
  }
}
