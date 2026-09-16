package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.EmeraldContainer
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.IndigoContainer
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.SurfaceBg
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHigh
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun TicketSplitTopBar(
  title: String = "TicketSplit",
  subtitle: String? = "GROUPS",
  showBackButton: Boolean = false,
  onBackClick: () -> Unit = {},
  onNotificationsClick: () -> Unit = {},
  onProfileClick: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  Surface(
    color = SurfaceBg.copy(alpha = 0.95f),
    shadowElevation = 2.dp,
    modifier = modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .height(64.dp)
        .padding(horizontal = 16.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        if (showBackButton) {
          IconButton(
            onClick = onBackClick,
            modifier = Modifier
              .size(44.dp)
              .testTag("back_button")
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowBack,
              contentDescription = "Back",
              tint = TextPrimary
            )
          }
        }

        // TicketSplit Ticket Logo Icon
        BrandLogoTicket(modifier = Modifier.size(width = 30.dp, height = 24.dp))

        if (subtitle != null) {
          Column {
            Text(
              text = title,
              style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                letterSpacing = (-0.3).sp
              ),
              color = TextPrimary,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
            Text(
              text = subtitle,
              style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                letterSpacing = 0.5.sp
              ),
              color = TextSecondary
            )
          }
        } else {
          Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall.copy(
              fontWeight = FontWeight.Bold,
              fontSize = 18.sp
            ),
            color = TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        // Notification bell with red badge
        Box(
          contentAlignment = Alignment.TopEnd,
          modifier = Modifier
            .size(44.dp)
            .clickable(onClick = onNotificationsClick)
            .testTag("notification_bell")
        ) {
          Box(
            modifier = Modifier.size(44.dp),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Notifications,
              contentDescription = "Notifications",
              tint = TextSecondary,
              modifier = Modifier.size(24.dp)
            )
          }
          Box(
            modifier = Modifier
              .padding(top = 10.dp, end = 10.dp)
              .size(8.dp)
              .clip(CircleShape)
              .background(ErrorRed)
          )
        }

        // Aarav User Avatar
        IconButton(
          onClick = onProfileClick,
          modifier = Modifier
            .size(44.dp)
            .testTag("profile_avatar_button")
        ) {
          AsyncImage(
            model = "https://lh3.googleusercontent.com/aida-public/AB6AXuAhBxa45kkyWRfmdWnfXUtTY7fywxuoNbzJUf-ZQ00iHCn2jRefgEWJhywhbS8AiklD4brUKrZgGi6ZmCK9t2B33s3oK6zRfoMWbn5aebAdxCG9vq_R1kxN6Pp1Fn1Gi4l2u3kaFeOM4C4gUbEFe2iiyaERB4u9TYT_iB-85TI556ETmS53mPWNgS02COreTQ5sk8IFxGDvWvls5v_vUcoqpZJoFtP18_PYY6m9x-khy7WnfhF7hDamhA",
            contentDescription = "User Profile",
            modifier = Modifier
              .size(34.dp)
              .clip(CircleShape)
              .border(2.dp, EmeraldPrimary.copy(alpha = 0.3f), CircleShape),
            contentScale = ContentScale.Crop
          )
        }
      }
    }
  }
}

@Composable
fun BrandLogoTicket(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(6.dp))
      .background(EmeraldContainer)
      .padding(horizontal = 4.dp, vertical = 2.dp),
    contentAlignment = Alignment.Center
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Center
    ) {
      Text(
        text = "₹",
        color = Color.White,
        fontWeight = FontWeight.Black,
        fontSize = 12.sp,
        lineHeight = 12.sp
      )
    }
  }
}

@Composable
fun TicketSplitBottomBar(
  currentRoute: String,
  onNavigate: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    color = SurfaceBg.copy(alpha = 0.95f),
    shadowElevation = 8.dp,
    modifier = modifier.fillMaxWidth()
  ) {
    NavigationBar(
      containerColor = Color.Transparent,
      tonalElevation = 0.dp,
      modifier = Modifier
        .fillMaxWidth()
        .height(68.dp)
    ) {
      NavigationBarItem(
        selected = currentRoute == "groups" || currentRoute == "group_details",
        onClick = { onNavigate("groups") },
        icon = { Icon(Icons.Default.Group, contentDescription = "Groups") },
        label = { Text("Groups", style = MaterialTheme.typography.labelSmall) },
        colors = NavigationBarItemDefaults.colors(
          selectedIconColor = EmeraldPrimary,
          selectedTextColor = EmeraldPrimary,
          indicatorColor = MintPrimaryFixed.copy(alpha = 0.4f),
          unselectedIconColor = TextSecondary,
          unselectedTextColor = TextSecondary
        ),
        modifier = Modifier.testTag("nav_groups")
      )

      NavigationBarItem(
        selected = currentRoute == "activity",
        onClick = { onNavigate("activity") },
        icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Activity") },
        label = { Text("Activity", style = MaterialTheme.typography.labelSmall) },
        colors = NavigationBarItemDefaults.colors(
          selectedIconColor = EmeraldPrimary,
          selectedTextColor = EmeraldPrimary,
          indicatorColor = MintPrimaryFixed.copy(alpha = 0.4f),
          unselectedIconColor = TextSecondary,
          unselectedTextColor = TextSecondary
        ),
        modifier = Modifier.testTag("nav_activity")
      )

      // Center Elevated Settle Button
      NavigationBarItem(
        selected = currentRoute == "upi_flow",
        onClick = { onNavigate("upi_flow") },
        icon = {
          Box(
            modifier = Modifier
              .offset(y = (-4).dp)
              .size(width = 46.dp, height = 34.dp)
              .shadow(6.dp, RoundedCornerShape(17.dp))
              .background(
                Brush.linearGradient(
                  colors = listOf(IndigoSecondary, IndigoContainer)
                ),
                shape = RoundedCornerShape(17.dp)
              ),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.CurrencyRupee,
              contentDescription = "Settle",
              tint = Color.White,
              modifier = Modifier.size(20.dp)
            )
          }
        },
        label = {
          Text(
            "Settle",
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
          )
        },
        colors = NavigationBarItemDefaults.colors(
          selectedTextColor = IndigoSecondary,
          indicatorColor = Color.Transparent,
          unselectedTextColor = TextSecondary
        ),
        modifier = Modifier.testTag("nav_settle")
      )

      NavigationBarItem(
        selected = currentRoute == "settings",
        onClick = { onNavigate("settings") },
        icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
        label = { Text("Settings", style = MaterialTheme.typography.labelSmall) },
        colors = NavigationBarItemDefaults.colors(
          selectedIconColor = EmeraldPrimary,
          selectedTextColor = EmeraldPrimary,
          indicatorColor = MintPrimaryFixed.copy(alpha = 0.4f),
          unselectedIconColor = TextSecondary,
          unselectedTextColor = TextSecondary
        ),
        modifier = Modifier.testTag("nav_settings")
      )
    }
  }
}

fun copyToClipboard(context: Context, text: String, label: String = "UPI ID") {
  val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
  val clip = ClipData.newPlainText(label, text)
  clipboard.setPrimaryClip(clip)
}
