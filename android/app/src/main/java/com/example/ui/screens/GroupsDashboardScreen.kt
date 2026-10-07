package com.example.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CallMade
import androidx.compose.material.icons.filled.CallReceived
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.EventRepeat
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.GroupAdd
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.Expense
import com.example.data.model.Group
import com.example.ui.TicketSplitViewModel
import com.example.ui.theme.EmeraldContainer
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.ErrorContainer
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.IndigoContainer
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
import com.example.ui.theme.TertiaryFixed
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun GroupsDashboardScreen(
  viewModel: TicketSplitViewModel,
  groups: List<Group>,
  expenses: List<Expense>,
  onGroupClick: (String) -> Unit,
  onAddExpenseClick: () -> Unit,
  onSettleClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val infiniteTransition = rememberInfiniteTransition(label = "pulse")
  val pulseScale by infiniteTransition.animateFloat(
    initialValue = 0.85f,
    targetValue = 1.15f,
    animationSpec = infiniteRepeatable(
      animation = tween(800, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulseScale"
  )

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .background(SurfaceBg),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Total Net Position Hero Card
      item {
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = SurfaceContainer,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("net_position_hero_card")
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
          ) {
            // Header: Total Net Position + UPI Live indicator
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Top
            ) {
              Column {
                Text(
                  text = "TOTAL NET POSITION",
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                  ),
                  color = TextSecondary
                )
                Row(
                  verticalAlignment = Alignment.Bottom,
                  horizontalArrangement = Arrangement.spacedBy(4.dp),
                  modifier = Modifier.padding(top = 2.dp)
                ) {
                  Text(
                    text = "+₹3,650",
                    style = MaterialTheme.typography.displayMedium.copy(
                      fontWeight = FontWeight.ExtraBold,
                      fontSize = 28.sp
                    ),
                    color = TextPrimary
                  )
                  Text(
                    text = "in your favor",
                    style = MaterialTheme.typography.labelMedium.copy(
                      fontWeight = FontWeight.Bold
                    ),
                    color = EmeraldPrimary
                  )
                }
              }

              // UPI Live Pill
              Surface(
                shape = RoundedCornerShape(20.dp),
                color = SurfaceContainerLowest,
                shadowElevation = 1.dp
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp),
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(8.dp)
                      .scale(pulseScale)
                      .clip(CircleShape)
                      .background(EmeraldPrimary)
                  )
                  Text(
                    text = "UPI Live",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = TextPrimary
                  )
                }
              }
            }

            // Dual Pill Split Summary
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // You get back
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = SurfaceContainerLowest,
                modifier = Modifier
                  .weight(1f)
                  .padding(vertical = 2.dp)
              ) {
                Row(
                  modifier = Modifier.padding(10.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(36.dp)
                      .clip(RoundedCornerShape(8.dp))
                      .background(MintPrimaryFixed),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.CallReceived,
                      contentDescription = null,
                      tint = MintOnPrimaryFixed,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Column {
                    Text(
                      text = "You get back",
                      style = MaterialTheme.typography.labelSmall,
                      color = TextSecondary
                    )
                    Text(
                      text = "₹4,850",
                      style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                      color = EmeraldPrimary
                    )
                  }
                }
              }

              // You owe
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = SurfaceContainerLowest,
                modifier = Modifier
                  .weight(1f)
                  .padding(vertical = 2.dp)
              ) {
                Row(
                  modifier = Modifier.padding(10.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(36.dp)
                      .clip(RoundedCornerShape(8.dp))
                      .background(ErrorContainer),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.CallMade,
                      contentDescription = null,
                      tint = ErrorRed,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Column {
                    Text(
                      text = "You owe",
                      style = MaterialTheme.typography.labelSmall,
                      color = TextSecondary
                    )
                    Text(
                      text = "₹1,200",
                      style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                      color = ErrorRed
                    )
                  }
                }
              }
            }

            // Quick Actions Bar
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // New Group
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = SurfaceContainerLowest,
                modifier = Modifier
                  .weight(1f)
                  .clickable { viewModel.showToast("Create New Group dialog opened") }
                  .testTag("action_new_group")
              ) {
                Column(
                  horizontalAlignment = Alignment.CenterHorizontally,
                  modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
                  verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(36.dp)
                      .clip(CircleShape)
                      .background(EmeraldPrimary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.GroupAdd,
                      contentDescription = null,
                      tint = EmeraldPrimary,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Text(
                    text = "New Group",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary
                  )
                }
              }

              // Join Code
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = SurfaceContainerLowest,
                modifier = Modifier
                  .weight(1f)
                  .clickable { viewModel.showToast("Enter Group Invite Code") }
                  .testTag("action_join_code")
              ) {
                Column(
                  horizontalAlignment = Alignment.CenterHorizontally,
                  modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
                  verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(36.dp)
                      .clip(CircleShape)
                      .background(SurfaceContainer),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.Link,
                      contentDescription = null,
                      tint = TextSecondary,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Text(
                    text = "Join Code",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = TextPrimary
                  )
                }
              }

              // Scan UPI
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = IndigoSecondary,
                modifier = Modifier
                  .weight(1f)
                  .clickable { onSettleClick() }
                  .testTag("action_scan_upi")
              ) {
                Column(
                  horizontalAlignment = Alignment.CenterHorizontally,
                  modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
                  verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(36.dp)
                      .clip(CircleShape)
                      .background(Color.White.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.QrCodeScanner,
                      contentDescription = null,
                      tint = Color.White,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Text(
                    text = "Scan UPI",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = Color.White
                  )
                }
              }
            }
          }
        }
      }

      // 2. Quick Floating Settlement Bar
      item {
        Surface(
          shape = RoundedCornerShape(14.dp),
          color = SurfaceContainerHighest,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("instant_settle_bar")
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp),
              modifier = Modifier.weight(1f)
            ) {
              Box(
                modifier = Modifier
                  .size(32.dp)
                  .clip(CircleShape)
                  .background(IndigoSecondary),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.Bolt,
                  contentDescription = null,
                  tint = Color.White,
                  modifier = Modifier.size(18.dp)
                )
              }
              Column {
                Text(
                  text = "Instant UPI Settle",
                  style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                  color = TextPrimary
                )
                Text(
                  text = "Clear Goa trip dues to Rohan",
                  style = MaterialTheme.typography.bodySmall,
                  color = TextSecondary,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }

            Button(
              onClick = onSettleClick,
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.buttonColors(containerColor = IndigoSecondary),
              contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
              modifier = Modifier.testTag("instant_settle_pay_button")
            ) {
              Text(
                text = "Pay ₹1,200",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = Color.White
              )
            }
          }
        }
      }

      // 3. Active Groups Header
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Text(
              text = "Active Groups",
              style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
              color = TextPrimary
            )
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(SurfaceContainerHigh)
                .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
              Text(
                text = "${groups.size}",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = TextPrimary
              )
            }
          }

          Text(
            text = "View All",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = EmeraldPrimary,
            modifier = Modifier
              .clickable { viewModel.showToast("All Groups view") }
              .padding(4.dp)
          )
        }
      }

      // 4. Groups List Cards
      items(groups) { group ->
        GroupCardItem(
          group = group,
          onClick = { onGroupClick(group.id) }
        )
      }

      // 5. Recent Expenses Section
      item {
        Spacer(modifier = Modifier.height(4.dp))
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
            text = "Activity",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = EmeraldPrimary,
            modifier = Modifier
              .clickable { viewModel.navigateTo("activity") }
              .padding(4.dp)
          )
        }
      }

      // Top 3 Recent Expenses
      items(expenses.take(3)) { expense ->
        RecentExpenseItem(expense = expense)
      }

      // 6. TicketSplit Pro Early Access Monetization Banner
      item {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = SurfaceContainer,
          shadowElevation = 1.dp,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("ticketsplit_pro_card")
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
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
                Box(
                  modifier = Modifier
                    .size(30.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(TertiaryContainer),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.Verified,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                  )
                }
                Text(
                  text = "TicketSplit Pro",
                  style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                  color = TextPrimary
                )
              }

              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(12.dp))
                  .background(TertiaryFixed)
                  .padding(horizontal = 8.dp, vertical = 2.dp)
              ) {
                Text(
                  text = "EARLY ACCESS",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = TextPrimary
                )
              }
            }

            Text(
              text = "Auto-fetch SMS & UPI transaction statements and send automated rent payment nudges on WhatsApp.",
              style = MaterialTheme.typography.bodyMedium,
              color = TextSecondary
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text(
                  text = "Free trial",
                  style = MaterialTheme.typography.labelSmall,
                  color = TextSecondary
                )
                Text(
                  text = "30 days free",
                  style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                  color = TextPrimary
                )
              }

              Button(
                onClick = { viewModel.showToast("30-Day Pro Free Trial activated!", "verified") },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
              ) {
                Text(
                  text = "Try Free",
                  style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                  color = Color.White
                )
              }
            }
          }
        }
      }
    }

    // Extended Floating Action Button: Add Expense
    ExtendedFloatingActionButton(
      onClick = onAddExpenseClick,
      icon = { Icon(Icons.Default.Add, contentDescription = "Add") },
      text = {
        Text(
          "Add Expense",
          style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
        )
      },
      containerColor = EmeraldPrimary,
      contentColor = Color.White,
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(end = 16.dp, bottom = 16.dp)
        .testTag("fab_add_expense")
    )
  }
}

@Composable
fun GroupCardItem(
  group: Group,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(18.dp),
    color = SurfaceContainerLowest,
    shadowElevation = 1.dp,
    modifier = modifier
      .fillMaxWidth()
      .clickable(onClick = onClick)
      .testTag("group_card_${group.id}")
  ) {
    Column(
      modifier = Modifier.padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
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
          if (group.imageUrl.isNotEmpty()) {
            AsyncImage(
              model = group.imageUrl,
              contentDescription = group.name,
              modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp)),
              contentScale = ContentScale.Crop
            )
          } else {
            Box(
              modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(
                  if (group.id == "g4") EmeraldPrimary.copy(alpha = 0.1f) else SurfaceContainer
                ),
              contentAlignment = Alignment.Center
            ) {
              if (group.id == "g3") {
                Icon(
                  imageVector = Icons.Default.Coffee,
                  contentDescription = null,
                  tint = TextPrimary,
                  modifier = Modifier.size(24.dp)
                )
              } else {
                Icon(
                  imageVector = Icons.Default.FitnessCenter,
                  contentDescription = null,
                  tint = EmeraldPrimary,
                  modifier = Modifier.size(24.dp)
                )
              }
            }
          }

          Column {
            Text(
              text = group.name,
              style = MaterialTheme.typography.headlineSmall.copy(
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
              ),
              color = TextPrimary,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
            Text(
              text = group.location,
              style = MaterialTheme.typography.bodySmall,
              color = TextSecondary
            )
          }
        }

        // Net balance badge
        if (group.isSettled) {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(12.dp))
              .background(SurfaceContainer)
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Row(
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
                text = "Settled",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = TextSecondary
              )
            }
          }
        } else if (group.netBalance > 0) {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(12.dp))
              .background(MintPrimaryFixed)
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text(
              text = "+₹${group.netBalance.toInt()}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = MintOnPrimaryFixed
            )
          }
        } else {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(12.dp))
              .background(ErrorContainer)
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text(
              text = "-₹${kotlin.math.abs(group.netBalance).toInt()}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = ErrorRed
            )
          }
        }
      }

      // Context Pill (Rent reminder or last paid dinner)
      if (group.id == "g1") {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = SurfaceContainerLow,
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              Icon(
                imageVector = Icons.Default.EventRepeat,
                contentDescription = null,
                tint = EmeraldPrimary,
                modifier = Modifier.size(16.dp)
              )
              Text(
                text = "Next rent due in 4 days (₹32,000/mo)",
                style = MaterialTheme.typography.bodySmall,
                color = TextPrimary
              )
            }
            Text(
              text = "Reminder On",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = EmeraldPrimary
            )
          }
        }
      } else if (group.lastPaidSummary != null) {
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = SurfaceContainerLow,
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Receipt,
                contentDescription = null,
                tint = IndigoSecondary,
                modifier = Modifier.size(16.dp)
              )
              Text(
                text = group.lastPaidSummary,
                style = MaterialTheme.typography.bodySmall,
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }
            Text(
              text = "You owe ₹1,200",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = ErrorRed
            )
          }
        }
      }

      // Member faces footer
      if (group.id == "g1") {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy((-6).dp)) {
            listOf("AR", "PR", "RO").forEach { initials ->
              Box(
                modifier = Modifier
                  .size(24.dp)
                  .clip(CircleShape)
                  .background(SurfaceContainer)
                  .border(1.5.dp, Color.White, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = initials,
                  style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                  ),
                  color = TextSecondary
                )
              }
            }
            Box(
              modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(EmeraldPrimary)
                .border(1.5.dp, Color.White, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = "You",
                style = MaterialTheme.typography.labelSmall.copy(
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold
                ),
                color = Color.White
              )
            }
          }

          Text(
            text = "You get back ₹3,400",
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            color = EmeraldPrimary
          )
        }
      }
    }
  }
}

@Composable
fun RecentExpenseItem(
  expense: Expense,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(14.dp),
    color = SurfaceContainerLowest,
    shadowElevation = 1.dp,
    modifier = modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier.padding(14.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.weight(1f)
      ) {
        Box(
          modifier = Modifier
            .size(40.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceContainer),
          contentAlignment = Alignment.Center
        ) {
          val icon = when (expense.category) {
            "Food & Drinks" -> Icons.Default.Restaurant
            "Travel" -> Icons.Default.LocalGasStation
            else -> Icons.Default.ShoppingCart
          }
          Icon(
            imageVector = icon,
            contentDescription = null,
            tint = TextPrimary,
            modifier = Modifier.size(20.dp)
          )
        }

        Column {
          Text(
            text = expense.title,
            style = MaterialTheme.typography.headlineSmall.copy(
              fontSize = 15.sp,
              fontWeight = FontWeight.SemiBold
            ),
            color = TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
          Text(
            text = expense.splitSummary,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      Column(horizontalAlignment = Alignment.End) {
        if (expense.youGetBackAmount > 0) {
          Text(
            text = "+₹${String.format("%.2f", expense.youGetBackAmount)}",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = EmeraldPrimary
          )
        } else {
          Text(
            text = "-₹${String.format("%.2f", expense.youOweAmount)}",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = ErrorRed
          )
        }
        Text(
          text = expense.dateText,
          style = MaterialTheme.typography.labelSmall,
          color = TextSecondary
        )
      }
    }
  }
}
