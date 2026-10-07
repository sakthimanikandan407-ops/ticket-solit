import { syncExpensesToSupabase, getSupabase } from "./supabase.js";

export const AARAV = {
  id: "m1",
  name: "Aarav",
  initials: "AY",
  phoneNumber: "+91 9876543210",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  upiId: "aarav.verma@okhdfcbank",
  isCurrentUser: true,
  email: "aarav.verma@example.com",
  defaultSharePercent: 25.0
};

export const ROHAN = {
  id: "m2",
  name: "Rohan Sharma",
  initials: "RS",
  phoneNumber: "+91 9811223344",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  upiId: "rohan.sharma@paytm",
  email: "rohan.sharma@example.com",
  isCurrentUser: false
};

export const PRIYA = {
  id: "m3",
  name: "Priya Nair",
  initials: "PN",
  phoneNumber: "+91 9845012345",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  upiId: "priya.v@okaxis",
  email: "priya.nair@example.com",
  isCurrentUser: false
};

export const NIKHIL = {
  id: "m4",
  name: "Nikhil Verma",
  initials: "NV",
  phoneNumber: "+91 9733445566",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  upiId: "nikhil.v@ybl",
  email: "nikhil.verma@example.com",
  isCurrentUser: false
};

export const DEMO_USERS = [AARAV, ROHAN, PRIYA, NIKHIL];

export const INITIAL_GROUPS = [
  {
    id: "g1",
    name: "Green Glen Flat 402",
    type: "rent", // "rent" | "trip" | "office" | "event"
    typeIcon: "🏠",
    typeLabel: "Rent & Flatshare",
    location: "HSR Layout, Sector 2 • 4 Flatmates",
    memberCount: 4,
    members: [AARAV, ROHAN, PRIYA, NIKHIL],
    netBalance: 3400.0,
    totalSpendMonth: 48600.0,
    nextRentDueDays: 4,
    monthlyRent: 32000.0,
    rentDueDateText: "1st Nov",
    landlordUpi: "suresh.sharma@okaxis",
    isAutoSplitRentActive: true,
    remindersOn: true,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=80",
    flatGroupUpiId: "greenglen402@axisbank",
    rentPaymentAutomation: true,
    smartDebtMinimization: true,
    lastActive: Date.now() - 3600000
  },
  {
    id: "g2",
    name: "Goa Roadtrip Nov 🏖️",
    type: "trip",
    typeIcon: "🏖️",
    typeLabel: "Group Trip",
    location: "North Goa Trip • 5 members",
    memberCount: 5,
    members: [AARAV, ROHAN],
    netBalance: -1200.0,
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=80",
    lastPaidSummary: "Last paid: Thalassa Dinner by Rohan",
    lastActive: Date.now() - 86400000
  },
  {
    id: "g3",
    name: "Chai & Snacks (Office)",
    type: "office",
    typeIcon: "☕",
    typeLabel: "Office Team",
    location: "Daily tapri runs • 6 colleagues",
    memberCount: 6,
    members: [AARAV],
    netBalance: 0.0,
    isSettled: true,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
    lastActive: Date.now() - 172800000
  },
  {
    id: "g4",
    name: "Cult.fit Annual Pass Split",
    type: "event",
    typeIcon: "🎟️",
    typeLabel: "Event / Pooling",
    location: "Annual gym combo • 2 members",
    memberCount: 2,
    members: [AARAV],
    netBalance: 1450.0,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    lastActive: Date.now() - 259200000
  }
];

export const INITIAL_EXPENSES = [
  {
    id: "e1",
    groupId: "g1",
    title: "October Broadband (Airtel Xstream)",
    totalAmount: 1499.0,
    paidByName: "Aarav (You)",
    paidByMemberId: "m1",
    splitSummary: "Paid by Aarav (You) • Split 4 ways",
    dateText: "Oct 24 • Fast 300 Mbps bill",
    category: "Utilities",
    categoryEmoji: "⚡",
    youGetBackAmount: 1124.25,
    settledText: "Settled by 2/4"
  },
  {
    id: "e2",
    groupId: "g1",
    title: "Maid & Cook Salary",
    totalAmount: 12000.0,
    paidByName: "Rohan Sharma",
    paidByMemberId: "m2",
    splitSummary: "Paid by Rohan • Split equally",
    dateText: "Oct 20 • Sunita Di (Cooking + Cleaning)",
    category: "Rent",
    categoryEmoji: "🏠",
    youOweAmount: 3000.0
  },
  {
    id: "e3",
    groupId: "g1",
    title: "Water Cans & Groceries (Blinkit)",
    totalAmount: 850.0,
    paidByName: "Priya Nair",
    paidByMemberId: "m3",
    splitSummary: "Paid by Priya • Split equally",
    dateText: "Oct 18 • 2 Bisleri cans + dishwash",
    category: "Groceries",
    categoryEmoji: "🛒",
    youOweAmount: 212.50
  },
  {
    id: "e4",
    groupId: "g1",
    title: "Society Maintenance",
    totalAmount: 4200.0,
    paidByName: "Aarav (You)",
    paidByMemberId: "m1",
    splitSummary: "Paid by Aarav (You) • Split 4 ways",
    dateText: "Oct 05 • Lift, DG & Security Fund",
    category: "Utilities",
    categoryEmoji: "⚡",
    youGetBackAmount: 3150.0,
    receiptName: "maintenance_oct.pdf"
  },
  {
    id: "e5",
    groupId: "g1",
    title: "Swiggy Dinner",
    totalAmount: 1250.0,
    paidByName: "Aarav (You)",
    paidByMemberId: "m1",
    splitSummary: "You paid ₹1,250 • split 3 ways",
    dateText: "Today, 9:20 PM",
    category: "Food & Drinks",
    categoryEmoji: "🍕",
    youGetBackAmount: 833.33
  },
  {
    id: "e6",
    groupId: "g2",
    title: "Shell Fuel Station",
    totalAmount: 3600.0,
    paidByName: "Aarav (You)",
    paidByMemberId: "m1",
    splitSummary: "Aarav paid ₹3,600 • Goa Trip",
    dateText: "Yesterday",
    category: "Travel",
    categoryEmoji: "🚕",
    youOweAmount: 720.00
  },
  {
    id: "e7",
    groupId: "g1",
    title: "Blinkit Grocery Restock",
    totalAmount: 940.0,
    paidByName: "Priya Nair",
    paidByMemberId: "m3",
    splitSummary: "Priya paid ₹940 • Flat 402",
    dateText: "2 Nov",
    category: "Groceries",
    categoryEmoji: "🛒",
    youOweAmount: 235.00
  }
];

export const INITIAL_BALANCES = [
  { member: ROHAN, amountYouOwe: 1575.0, amountOwedToYou: 0.0, isSettled: false },
  { member: PRIYA, amountYouOwe: 0.0, amountOwedToYou: 975.0, isSettled: false },
  { member: NIKHIL, amountYouOwe: 0.0, amountOwedToYou: 1425.0, isSettled: false }
];

export const INITIAL_STEPS = [
  {
    title: "UPI Intent Dispatched",
    timeOrBadge: "11:42 AM",
    description: "Deep link handshake initiated from device",
    status: "COMPLETED"
  },
  {
    title: "Payment in Progress",
    timeOrBadge: "Awaiting Bank",
    description: "NPCI & receiving bank acknowledgement pending",
    status: "IN_PROGRESS"
  },
  {
    title: "Settled & Recorded in Group",
    timeOrBadge: "Pending",
    description: "Balances will instantly zero out for group",
    status: "PENDING"
  }
];

// Contextual Native Affiliate Offers (§3.3)
export const AFFILIATE_OFFERS = {
  trip: {
    partnerName: "MakeMyTrip & Ixigo",
    badge: "TRAVEL PERK",
    title: "Flight & Hotel Discounts for Goa",
    description: "Save up to ₹800 on group bookings + zero forex card fees.",
    promoCode: "TICKETTRIP",
    icon: "fa-solid fa-plane-departure",
    linkUrl: "https://www.makemytrip.com",
    terms: "Valid on group stays & flights. Flat 15% instant discount.",
    commissionRate: "12% Rev Share"
  },
  rent: {
    partnerName: "Furlenco & Urban Company",
    badge: "FLATSHARE PERK",
    title: "Appliance & Furniture Rental",
    description: "Rent washing machines & sofas starting ₹499/mo for Flat 402.",
    promoCode: "FLAT402SAVE",
    icon: "fa-solid fa-couch",
    linkUrl: "https://www.furlenco.com",
    terms: "Flat 25% off 1st month rental. Free doorstep setup and relocation.",
    commissionRate: "₹650 / Lead"
  },
  office: {
    partnerName: "Swiggy Corporate & Zepto",
    badge: "FOOD PERK",
    title: "Flat ₹120 Off on Group Lunch",
    description: "Combine orders on Swiggy and split delivery costs.",
    promoCode: "CHAI120",
    icon: "fa-solid fa-utensils",
    linkUrl: "https://www.swiggy.com",
    terms: "Minimum order ₹499. Apply coupon on checkout.",
    commissionRate: "8% CPS"
  },
  event: {
    partnerName: "BookMyShow & District",
    badge: "EVENT PERK",
    title: "Group Cinema & Pass Discount",
    description: "Buy 3 or more tickets and get flat 20% cashback.",
    promoCode: "GROUPFUN",
    icon: "fa-solid fa-ticket",
    linkUrl: "https://in.bookmyshow.com",
    terms: "Valid on 3+ tickets booked in single session.",
    commissionRate: "10% Rev Share"
  },
  settlement: {
    partnerName: "Swiggy & Starbucks Partner Perk",
    badge: "SETTLEMENT REWARD",
    title: "Flat ₹100 Off on Next Group Meal",
    description: "You've settled your balance! Celebrate with an instant group food discount.",
    promoCode: "SETTLEWIN100",
    icon: "fa-solid fa-gift",
    linkUrl: "https://www.swiggy.com",
    terms: "Valid on orders above ₹300. Exclusive reward for settled TicketSplit users.",
    commissionRate: "15% Commission"
  }
};

class Store {
  constructor() {
    this.storageKey = "ticketsplit_v3";
    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.currentUser && parsed.currentUser.name) {
          parsed.currentUser.name = parsed.currentUser.name.replace(/\s*\(You\)/g, "").trim();
        }
        if (parsed.balances) {
          parsed.balances = parsed.balances.map(b => ({
            amountYouOwe: b.amountYouOwe !== undefined ? b.amountYouOwe : 0,
            amountOwedToYou: b.amountOwedToYou !== undefined ? b.amountOwedToYou : 0,
            ...b
          }));
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
    return {
      currentUser: AARAV,
      isOnboarded: true, // set to true so existing demo works immediately, but user can log out to test phone OTP
      pendingOtp: null,
      groups: INITIAL_GROUPS,
      expenses: INITIAL_EXPENSES,
      balances: INITIAL_BALANCES,
      settlementSteps: INITIAL_STEPS,
      selectedGroupId: "g1",
      settlePayee: ROHAN,
      settleAmount: 2100.0,
      settings: {
        autoSmsSync: true,
        pushNotifications: true,
        upiAutopayRent: false,
        themeMode: "light"
      }
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    this.notify();

    syncExpensesToSupabase(this.state.expenses);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  get currentUser() {
    return this.state.currentUser || AARAV;
  }

  get selectedGroup() {
    return this.state.groups.find(g => g.id === this.state.selectedGroupId) || this.state.groups[0];
  }

  get groupExpenses() {
    return this.state.expenses.filter(e => e.groupId === this.state.selectedGroupId);
  }

  getGroupBalances(groupId) {
    const group = this.state.groups.find(g => g.id === groupId) || this.selectedGroup;
    if (!group) return [];

    const curUser = this.currentUser;
    const groupExpenses = this.state.expenses.filter(e => e.groupId === group.id);
    const otherMembers = (group.members || []).filter(m => m.id !== curUser.id);

    return otherMembers.map(member => {
      let amountYouOwe = 0;
      let amountOwedToYou = 0;
      let settlementsPaid = 0;
      let settlementsReceived = 0;

      groupExpenses.forEach(exp => {
        const total = parseFloat(exp.totalAmount) || 0;
        const count = Math.max(1, exp.includedMemberIds?.length || group.members.length);

        // Check if this expense is a settlement
        if (exp.id && exp.id.startsWith("e_settle_")) {
          if (exp.paidByMemberId === curUser.id && (exp.paidToMemberId === member.id || exp.title.includes(member.name))) {
            settlementsPaid += total;
          } else if (exp.paidByMemberId === member.id && (exp.paidToMemberId === curUser.id || exp.title.includes(curUser.name) || exp.title.includes(member.name))) {
            settlementsReceived += total;
          }
          return;
        }

        // Current user paid
        if (exp.paidByMemberId === curUser.id) {
          const isIncluded = !exp.includedMemberIds || exp.includedMemberIds.length === 0 || exp.includedMemberIds.includes(member.id);
          if (isIncluded) {
            let share = 0;
            if (exp.splitMode === "Unequally" || exp.splitMode === "By Percent") {
              share = (exp.memberSplits && exp.memberSplits[member.id]) || 0;
              if (exp.splitMode === "By Percent") share = (total * share) / 100;
            } else {
              share = total / count;
            }
            amountOwedToYou += share;
          }
        }
        // This member paid
        else if (exp.paidByMemberId === member.id) {
          if (exp.settledText === "Settled via UPI" && exp.youOweAmount === 0) {
            return;
          }
          const youIncluded = !exp.includedMemberIds || exp.includedMemberIds.length === 0 || exp.includedMemberIds.includes(curUser.id);
          if (youIncluded) {
            let share = 0;
            if (exp.splitMode === "Unequally" || exp.splitMode === "By Percent") {
              share = (exp.memberSplits && exp.memberSplits[curUser.id]) || 0;
              if (exp.splitMode === "By Percent") share = (total * share) / 100;
            } else {
              if (exp.youOweAmount !== undefined && exp.youOweAmount > 0) {
                share = exp.youOweAmount;
              } else {
                share = total / count;
              }
            }
            amountYouOwe += share;
          }
        }
      });

      amountYouOwe = Math.max(0, amountYouOwe - settlementsPaid);
      amountOwedToYou = Math.max(0, amountOwedToYou - settlementsReceived);

      // Net debt minimization between curUser and member
      let netOwedToYou = 0;
      let netYouOwe = 0;

      if (amountOwedToYou > amountYouOwe) {
        netOwedToYou = Math.round((amountOwedToYou - amountYouOwe) * 100) / 100;
      } else if (amountYouOwe > amountOwedToYou) {
        netYouOwe = Math.round((amountYouOwe - amountOwedToYou) * 100) / 100;
      }

      return {
        member,
        amountYouOwe: netYouOwe,
        amountOwedToYou: netOwedToYou,
        isSettled: netYouOwe === 0 && netOwedToYou === 0
      };
    });
  }

  // --- Spend Analytics (§8.2 Q4) ---
  getGroupAnalytics(groupId) {
    const expenses = this.state.expenses.filter(e => e.groupId === groupId);
    const totalSpend = expenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const group = this.state.groups.find(g => g.id === groupId) || {};
    const memberCount = (group.members && group.members.length) || 3;
    const avgPerPerson = totalSpend > 0 ? Math.round(totalSpend / memberCount) : 0;

    // Highest expense
    const highestExpense = expenses.length > 0 
      ? [...expenses].sort((a, b) => b.totalAmount - a.totalAmount)[0] 
      : null;

    // Group by category
    const categoryTotals = {};
    expenses.forEach(e => {
      const cat = e.category || "Utilities";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.totalAmount;
    });

    const categoryColors = {
      "Groceries": "#00855d",
      "Rent": "#b15f00",
      "Food & Drinks": "#645efb",
      "Travel": "#f72585",
      "Utilities": "#00b4d8"
    };

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpend > 0 ? Math.round((amt / totalSpend) * 100) : 0,
      color: categoryColors[cat] || "#645efb",
      emoji: cat === "Groceries" ? "🛒" : cat === "Rent" ? "🏠" : cat === "Food & Drinks" ? "🍕" : cat === "Travel" ? "🚕" : "⚡"
    })).sort((a, b) => b.amount - a.amount);

    // Group by paidBy member
    const memberTotals = {};
    expenses.forEach(e => {
      const payer = e.paidByName || "Someone";
      memberTotals[payer] = (memberTotals[payer] || 0) + e.totalAmount;
    });

    const memberBreakdown = Object.entries(memberTotals).map(([name, amt]) => ({
      name,
      amount: amt,
      percentage: totalSpend > 0 ? Math.round((amt / totalSpend) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalSpend,
      expenseCount: expenses.length,
      memberCount,
      avgPerPerson,
      highestExpense,
      categoryBreakdown,
      memberBreakdown
    };
  }

  exportGroupSpendCsv(groupId) {
    const expenses = this.state.expenses.filter(e => e.groupId === groupId);
    const headers = ["Title", "Category", "Amount_INR", "Paid_By", "Date", "Split_Summary"];
    const rows = expenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.totalAmount,
      `"${e.paidByName}"`,
      `"${e.dateText}"`,
      `"${e.splitSummary}"`
    ]);
    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  // --- Phone Number + OTP Onboarding (§2.2–§2.4) ---
  startPhoneOnboarding(phoneNumber) {
    this.state.pendingPhoneNumber = phoneNumber;
    this.state.pendingOtp = "123456";
    this.saveState();
    return "123456";
  }

  verifyOtp(enteredOtp) {
    if (enteredOtp === "123456" || enteredOtp === this.state.pendingOtp || enteredOtp.length === 6) {
      this.state.otpVerified = true;
      this.saveState();
      return true;
    }
    return false;
  }

  completeProfile(name, avatarUrl = null) {
    const phone = this.state.pendingPhoneNumber || "+91 9876543210";
    const newUser = {
      id: `m_${Date.now()}`,
      name: name.trim() || "Flatmate",
      initials: (name[0] || "U").toUpperCase(),
      phoneNumber: phone,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      upiId: `${name.toLowerCase().replace(/\s+/g, "")}@okaxis`,
      isCurrentUser: true,
      defaultSharePercent: 25.0
    };

    this.state.currentUser = newUser;
    this.state.isOnboarded = true;
    this.state.pendingPhoneNumber = null;
    this.state.pendingOtp = null;

    // Add new user to Flat 402
    this.state.groups = this.state.groups.map(g => {
      if (g.id === "g1") {
        return {
          ...g,
          members: [...g.members.filter(m => m.id !== newUser.id), newUser],
          memberCount: g.members.length + 1
        };
      }
      return g;
    });

    this.saveState();
    return newUser;
  }

  updateUserName(newName) {
    const clean = newName.trim();
    if (!clean) return;
    const curUser = this.currentUser;
    const initials = clean.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
    
    this.state.currentUser = {
      ...curUser,
      name: clean,
      initials
    };

    const curId = curUser.id;
    this.state.groups = this.state.groups.map(g => ({
      ...g,
      members: g.members.map(m => m.id === curId ? { ...m, name: clean, initials } : m)
    }));

    const demo = DEMO_USERS.find(u => u.id === curId);
    if (demo) {
      demo.name = clean;
      demo.initials = initials;
    }

    this.saveState();
  }

  loginAs(user) {
    const cleanName = user.name.replace(/\s*\(You\)/g, "").trim();
    this.state.currentUser = { ...user, name: cleanName, isCurrentUser: true };
    this.state.isOnboarded = true;

    this.state.groups = this.state.groups.map(g => ({
      ...g,
      members: g.members.map(m => ({
        ...m,
        isCurrentUser: m.id === user.id
      }))
    }));

    DEMO_USERS.forEach(u => {
      u.isCurrentUser = (u.id === user.id);
    });

    this.saveState();
  }

  logout() {
    this.state.isOnboarded = false;
    this.saveState();
  }

  // --- Edit UPI Methods ---
  updatePersonalUpi(newUpi) {
    const vpa = newUpi.trim();
    if (!vpa) return;
    this.state.currentUser = { ...this.state.currentUser, upiId: vpa };

    const curId = this.state.currentUser.id;
    this.state.groups = this.state.groups.map(g => ({
      ...g,
      members: g.members.map(m => m.id === curId ? { ...m, upiId: vpa } : m)
    }));

    this.state.balances = this.state.balances.map(b => 
      b.member.id === curId ? { ...b, member: { ...b.member, upiId: vpa } } : b
    );

    this.saveState();
  }

  updateFlatUpi(groupId, newUpi) {
    const vpa = newUpi.trim();
    this.state.groups = this.state.groups.map(g => 
      g.id === groupId ? { ...g, flatGroupUpiId: vpa } : g
    );
    this.saveState();
  }

  updateLandlordUpi(groupId, newUpi) {
    const vpa = newUpi.trim();
    this.state.groups = this.state.groups.map(g => 
      g.id === groupId ? { ...g, landlordUpi: vpa } : g
    );
    this.saveState();
  }

  updateMemberUpi(memberId, newUpi) {
    const vpa = newUpi.trim();
    this.state.groups = this.state.groups.map(g => ({
      ...g,
      members: g.members.map(m => m.id === memberId ? { ...m, upiId: vpa } : m)
    }));
    this.state.balances = this.state.balances.map(b => 
      b.member.id === memberId ? { ...b, member: { ...b.member, upiId: vpa } } : b
    );
    this.saveState();
  }

  addMemberToGroup(groupId, memberData) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group) return null;

    const newMember = {
      id: `m_${Date.now()}`,
      name: memberData.name.trim() || "New Member",
      initials: (memberData.name.trim()[0] || "M").toUpperCase(),
      phoneNumber: memberData.phoneNumber || "+91 9800011122",
      avatarUrl: memberData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      upiId: memberData.upiId || `${memberData.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@okaxis`,
      isCurrentUser: false,
      defaultSharePercent: Math.round(100 / (group.members.length + 1))
    };

    group.members.push(newMember);
    group.memberCount = group.members.length;

    // Add balance tracking record for this member
    this.state.balances.push({
      member: newMember,
      amountOwedToYou: 0.0,
      isSettled: true,
      lastPaymentUpi: null
    });

    this.saveState();
    return newMember;
  }

  clearUserUsages() {
    const curId = this.currentUser.id;
    this.state.expenses = this.state.expenses.filter(e => e.paidByMemberId !== curId);

    this.state.balances = this.state.balances.map(b => ({
      ...b,
      amountOwedToYou: 0.0,
      isSettled: true
    }));

    this.state.groups = this.state.groups.map(g => ({
      ...g,
      netBalance: 0.0
    }));

    this.saveState();
  }

  resetAllData() {
    this.state = {
      currentUser: AARAV,
      isOnboarded: true,
      pendingOtp: null,
      groups: INITIAL_GROUPS,
      expenses: INITIAL_EXPENSES,
      balances: INITIAL_BALANCES,
      settlementSteps: INITIAL_STEPS,
      selectedGroupId: "g1",
      settlePayee: ROHAN,
      settleAmount: 2100.0,
      settings: {
        autoSmsSync: true,
        pushNotifications: true,
        upiAutopayRent: false,
        themeMode: "light"
      }
    };
    this.saveState();
  }

  selectGroup(groupId) {
    this.state.selectedGroupId = groupId;
    // Update recency
    this.state.groups = this.state.groups.map(g => g.id === groupId ? { ...g, lastActive: Date.now() } : g);
    this.saveState();
  }

  addNewGroup({ name, type = "trip", location, monthlyRent, landlordUpi, memberPhones = [] }) {
    const typeIcons = {
      trip: "🏖️",
      rent: "🏠",
      office: "☕",
      event: "🎟️"
    };

    const typeLabels = {
      trip: "Group Trip",
      rent: "Rent & Flatshare",
      office: "Office Team",
      event: "Event / Outing"
    };

    const newG = {
      id: `g_${Date.now()}`,
      name: name.trim(),
      type: type,
      typeIcon: typeIcons[type] || "📁",
      typeLabel: typeLabels[type] || "Group",
      location: location?.trim() || `${typeLabels[type]} Group`,
      memberCount: 4,
      members: [this.currentUser, ROHAN, PRIYA, NIKHIL],
      netBalance: 0.0,
      totalSpendMonth: 0.0,
      monthlyRent: monthlyRent ? parseFloat(monthlyRent) : (type === "rent" ? 25000 : 0.0),
      nextRentDueDays: 10,
      rentDueDateText: "1st Next Month",
      landlordUpi: landlordUpi ? landlordUpi.trim() : (type === "rent" ? "landlord@upi" : ""),
      flatGroupUpiId: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@axisbank`,
      imageUrl: type === "trip"
        ? "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500"
        : type === "rent"
          ? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
          : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500",
      remindersOn: true,
      rentPaymentAutomation: false,
      smartDebtMinimization: true,
      lastActive: Date.now()
    };

    this.state.groups = [newG, ...this.state.groups];
    this.state.selectedGroupId = newG.id;
    this.saveState();
    return newG;
  }

  toggleRentReminder(groupId) {
    this.state.groups = this.state.groups.map(g => {
      if (g.id === groupId) {
        return { ...g, remindersOn: !g.remindersOn };
      }
      return g;
    });
    this.saveState();
  }

  toggleRentAutomation(groupId) {
    this.state.groups = this.state.groups.map(g => {
      if (g.id === groupId) {
        return { ...g, rentPaymentAutomation: !g.rentPaymentAutomation };
      }
      return g;
    });
    this.saveState();
  }

  toggleSmartDebt(groupId) {
    this.state.groups = this.state.groups.map(g => {
      if (g.id === groupId) {
        return { ...g, smartDebtMinimization: !g.smartDebtMinimization };
      }
      return g;
    });
    this.saveState();
  }

  addExpense({
    groupId,
    title,
    amount,
    paidByMember,
    category,
    categoryEmoji,
    splitMode = "Equally", // "Equally" | "Unequally" | "By Percent" | "Itemized"
    memberSplits = {},
    includedMemberIds = [],
    receiptName = null,
    receiptUrl = null
  }) {
    const curUser = this.currentUser;
    const total = parseFloat(amount);
    let youGetBack = 0.0;
    let youOwe = 0.0;

    const youPaid = paidByMember.id === curUser.id;
    const count = Math.max(1, includedMemberIds.length);

    if (splitMode === "Unequally") {
      const yourShare = memberSplits[curUser.id] || 0.0;
      if (youPaid) {
        youGetBack = total - yourShare;
      } else {
        youOwe = yourShare;
      }
    } else if (splitMode === "By Percent") {
      const yourPercent = memberSplits[curUser.id] || 0.0;
      const yourShare = (total * yourPercent) / 100.0;
      if (youPaid) {
        youGetBack = total - yourShare;
      } else {
        youOwe = yourShare;
      }
    } else {
      // Default: Equally
      const perPerson = total / count;
      const youIncluded = includedMemberIds.includes(curUser.id);
      if (youPaid) {
        youGetBack = youIncluded ? total - perPerson : total;
      } else {
        youOwe = youIncluded ? perPerson : 0.0;
      }
    }

    const newExpense = {
      id: `e_${Date.now()}`,
      groupId,
      title: title.trim(),
      totalAmount: total,
      paidByName: paidByMember.id === curUser.id ? `${curUser.name.split(" ")[0]} (You)` : paidByMember.name,
      paidByMemberId: paidByMember.id,
      splitSummary: `Paid by ${paidByMember.id === curUser.id ? "You" : paidByMember.name} • ${splitMode} (${count} members)`,
      dateText: "Just now",
      category,
      categoryEmoji,
      youGetBackAmount: Math.max(0, youGetBack),
      youOweAmount: Math.max(0, youOwe),
      settledText: "Pending",
      receiptName,
      receiptUrl,
      receiptSizeText: receiptUrl ? "Photo receipt attached" : null
    };

    this.state.expenses = [newExpense, ...this.state.expenses];

    // Update group balance & recency
    this.state.groups = this.state.groups.map(g => {
      if (g.id === groupId) {
        const netDelta = youGetBack - youOwe;
        return {
          ...g,
          netBalance: (g.netBalance || 0) + netDelta,
          totalSpendMonth: (g.totalSpendMonth || 0) + total,
          lastActive: Date.now()
        };
      }
      return g;
    });

    // Update peer-to-peer balances
    if (!this.state.balances) {
      this.state.balances = [];
    }

    if (!youPaid) {
      // Someone else paid (e.g. Rohan). Current user owes 'youOwe' to paidByMember.
      let found = false;
      this.state.balances = this.state.balances.map(b => {
        if (b.member.id === paidByMember.id) {
          found = true;
          const currentYouOwe = b.amountYouOwe || 0;
          const currentOwedToYou = b.amountOwedToYou || 0;

          if (currentOwedToYou > 0) {
            if (currentOwedToYou >= youOwe) {
              return {
                ...b,
                amountOwedToYou: currentOwedToYou - youOwe,
                amountYouOwe: 0,
                isSettled: currentOwedToYou - youOwe === 0
              };
            } else {
              return {
                ...b,
                amountOwedToYou: 0,
                amountYouOwe: youOwe - currentOwedToYou,
                isSettled: false
              };
            }
          } else {
            return {
              ...b,
              amountYouOwe: currentYouOwe + youOwe,
              amountOwedToYou: 0,
              isSettled: false
            };
          }
        }
        return b;
      });

      if (!found) {
        this.state.balances.push({
          member: paidByMember,
          amountYouOwe: youOwe,
          amountOwedToYou: 0,
          isSettled: youOwe === 0
        });
      }
    } else {
      // Current user paid! Every other member in includedMemberIds owes their split share.
      const perPerson = total / count;
      this.state.balances = this.state.balances.map(b => {
        if (includedMemberIds.includes(b.member.id) && b.member.id !== curUser.id) {
          const memberShare = splitMode === "Unequally" || splitMode === "By Percent"
            ? (memberSplits[b.member.id] || 0)
            : perPerson;

          const currentYouOwe = b.amountYouOwe || 0;
          const currentOwedToYou = b.amountOwedToYou || 0;

          if (currentYouOwe > 0) {
            if (currentYouOwe >= memberShare) {
              return {
                ...b,
                amountYouOwe: currentYouOwe - memberShare,
                amountOwedToYou: 0,
                isSettled: currentYouOwe - memberShare === 0
              };
            } else {
              return {
                ...b,
                amountYouOwe: 0,
                amountOwedToYou: memberShare - currentYouOwe,
                isSettled: false
              };
            }
          } else {
            return {
              ...b,
              amountOwedToYou: currentOwedToYou + memberShare,
              amountYouOwe: 0,
              isSettled: false
            };
          }
        }
        return b;
      });
    }

    this.saveState();
    return newExpense;
  }

  openUpiFlow(payee, amount) {
    this.state.settlePayee = payee || ROHAN;
    this.state.settleAmount = amount || 2100.0;
    this.state.settlementSteps = [
      {
        title: "UPI Intent Dispatched",
        timeOrBadge: "Just now",
        description: `Handshake initiated for ${payee?.name || "Rohan Sharma"}`,
        status: "COMPLETED"
      },
      {
        title: "Payment in Progress",
        timeOrBadge: "Awaiting Bank",
        description: "NPCI & receiving bank acknowledgement pending",
        status: "IN_PROGRESS"
      },
      {
        title: "Settled & Recorded in Group",
        timeOrBadge: "Pending",
        description: "Balances will instantly zero out for Flat 402",
        status: "PENDING"
      }
    ];
    this.saveState();
  }

  settleMemberDebt(memberId, utr = null, isReceived = false, customAmount = null) {
    const group = this.state.groups.find(g => g.id === (this.state.selectedGroupId || "g1")) || this.selectedGroup;
    const member = (group?.members || []).find(m => m.id === memberId) ||
                   DEMO_USERS.find(m => m.id === memberId) ||
                   this.state.settlePayee ||
                   ROHAN;
    const curUser = this.currentUser;

    const bal = (this.state.balances || []).find(b => b.member.id === memberId);
    let settleAmount = customAmount;
    if (!settleAmount) {
      if (isReceived) {
        settleAmount = (bal && bal.amountOwedToYou) ? bal.amountOwedToYou : (this.state.settleAmount || 1737.25);
      } else {
        settleAmount = (bal && bal.amountYouOwe) ? bal.amountYouOwe : (this.state.settleAmount || 2100.0);
      }
    }
    settleAmount = parseFloat(settleAmount) || 0;

    this.state.balances = (this.state.balances || []).map(b => {
      if (b.member.id === memberId) {
        if (isReceived) {
          const rem = Math.max(0, (b.amountOwedToYou || 0) - settleAmount);
          const youOwe = b.amountYouOwe || 0;
          return { ...b, amountOwedToYou: rem, isSettled: rem === 0 && youOwe === 0 };
        } else {
          const rem = Math.max(0, (b.amountYouOwe || 0) - settleAmount);
          const owedToYou = b.amountOwedToYou || 0;
          return { ...b, amountYouOwe: rem, isSettled: rem === 0 && owedToYou === 0 };
        }
      }
      return b;
    });

    if (isReceived) {
      // Nikhil / Priya paid Aarav (Current User received money)
      const cleanMemberName = member.name.replace(/\s*\(You\)/g, '');
      const settlementExpense = {
        id: `e_settle_${Date.now()}`,
        groupId: this.state.selectedGroupId || "g1",
        title: `Payment Received from ${cleanMemberName}`,
        totalAmount: settleAmount,
        paidByName: cleanMemberName,
        paidByMemberId: member.id,
        paidToMemberId: curUser.id,
        splitSummary: `Settlement received by ${curUser.name.split(' ')[0]} via ${utr ? (utr.startsWith("UTR") ? utr : `UTR ${utr}`) : "Direct UPI / Cash"}`,
        dateText: "Just now • Settled",
        category: "Utilities",
        categoryEmoji: "💰",
        youGetBackAmount: 0.0,
        youOweAmount: 0.0,
        settledText: "Settled Full"
      };

      this.state.expenses = [settlementExpense, ...this.state.expenses];

      // Reduce the group receivable since money has been collected
      this.state.groups = this.state.groups.map(g => {
        if (g.id === (this.state.selectedGroupId || "g1")) {
          return {
            ...g,
            netBalance: Math.max(0, (g.netBalance || 0) - settleAmount),
            lastActive: Date.now()
          };
        }
        return g;
      });
    } else {
      // Aarav paid Rohan / Landlord
      this.state.expenses = this.state.expenses.map(e => {
        if (e.paidByMemberId === memberId && (e.youOweAmount || 0) > 0) {
          return { ...e, youOweAmount: 0.0, settledText: "Settled via UPI" };
        }
        return e;
      });

      this.state.settlementSteps = this.state.settlementSteps.map(step => ({
        ...step,
        status: "COMPLETED",
        timeOrBadge: "Success"
      }));

      const settlementExpense = {
        id: `e_settle_${Date.now()}`,
        groupId: this.state.selectedGroupId || "g1",
        title: `UPI Payment to ${member.name}`,
        totalAmount: settleAmount,
        paidByName: curUser.name,
        paidByMemberId: curUser.id,
        paidToMemberId: member.id,
        splitSummary: `Direct settlement to ${member.name} via ${utr ? (utr.startsWith("UTR") ? utr : `UTR ${utr}`) : "Instant NPCI Rail"}`,
        dateText: "Just now • Settled",
        category: "Utilities",
        categoryEmoji: "⚡",
        youGetBackAmount: 0.0,
        youOweAmount: 0.0,
        settledText: "Settled Full"
      };

      this.state.expenses = [settlementExpense, ...this.state.expenses];

      this.state.groups = this.state.groups.map(g => {
        if (g.id === (this.state.selectedGroupId || "g1")) {
          return {
            ...g,
            netBalance: (g.netBalance || 0) + settleAmount,
            lastActive: Date.now()
          };
        }
        return g;
      });
    }

    this.saveState();
  }

  updateSettings(partial) {
    this.state.settings = { ...this.state.settings, ...partial };
    this.saveState();
  }
}

export const store = new Store();
