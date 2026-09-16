package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.IndigoContainer
import com.example.ui.theme.IndigoSecondary
import com.example.ui.theme.MintPrimaryFixed
import com.example.ui.theme.MintOnPrimaryFixed
import com.example.ui.theme.SurfaceContainer
import com.example.ui.theme.SurfaceContainerHighest
import com.example.ui.theme.SurfaceContainerLow
import com.example.ui.theme.SurfaceContainerLowest
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

fun launchUpiIntent(
  context: Context,
  vpa: String,
  name: String,
  amount: Double,
  note: String = "TicketSplitSettlement",
  targetPackage: String? = null
) {
  try {
    val uri = Uri.Builder()
      .scheme("upi")
      .authority("pay")
      .appendQueryParameter("pa", vpa)
      .appendQueryParameter("pn", name)
      .appendQueryParameter("am", String.format("%.2f", amount))
      .appendQueryParameter("cu", "INR")
      .appendQueryParameter("tn", note)
      .build()

    val intent = Intent(Intent.ACTION_VIEW, uri)
    if (targetPackage != null) {
      intent.setPackage(targetPackage)
    }
    context.startActivity(intent)
  } catch (e: Exception) {
    Toast.makeText(
      context,
      "UPI App not installed on emulator. Opening fallback settlement...",
      Toast.LENGTH_SHORT
    ).show()
  }
}

@Composable
fun UpiAppListItem(
  appName: String,
  subtitle: String,
  badgeText: String? = null,
  logoContent: @Composable () -> Unit,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(14.dp),
    color = SurfaceContainerLowest,
    shadowElevation = 1.dp,
    modifier = modifier
      .fillMaxWidth()
      .clickable(onClick = onClick)
      .testTag("upi_app_${appName.replace(" ", "_").lowercase()}")
  ) {
    Box(modifier = Modifier.fillMaxWidth()) {
      if (badgeText != null) {
        Box(
          modifier = Modifier
            .align(Alignment.TopEnd)
            .clip(RoundedCornerShape(bottomStart = 8.dp))
            .background(MintPrimaryFixed)
            .padding(horizontal = 8.dp, vertical = 2.dp)
        ) {
          Text(
            text = badgeText,
            style = MaterialTheme.typography.labelSmall.copy(
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp
            ),
            color = MintOnPrimaryFixed
          )
        }
      }

      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          logoContent()
          Column {
            Text(
              text = appName,
              style = MaterialTheme.typography.headlineSmall.copy(
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
              ),
              color = TextPrimary
            )
            Text(
              text = subtitle,
              style = MaterialTheme.typography.bodySmall,
              color = TextSecondary
            )
          }
        }

        Icon(
          imageVector = Icons.AutoMirrored.Filled.ArrowForward,
          contentDescription = null,
          tint = TextSecondary,
          modifier = Modifier.size(18.dp)
        )
      }
    }
  }
}

@Composable
fun GPayLogo(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .size(40.dp)
      .clip(RoundedCornerShape(10.dp))
      .background(SurfaceContainer),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = "GPay",
      color = Color(0xFF1A73E8),
      fontWeight = FontWeight.Black,
      fontSize = 12.sp
    )
  }
}

@Composable
fun PhonePeLogo(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .size(40.dp)
      .clip(RoundedCornerShape(10.dp))
      .background(Color(0xFF5F259F)),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = "पे",
      color = Color.White,
      fontWeight = FontWeight.Black,
      fontSize = 18.sp
    )
  }
}

@Composable
fun PaytmLogo(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .size(40.dp)
      .clip(RoundedCornerShape(10.dp))
      .background(SurfaceContainer),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = "Paytm",
      color = Color(0xFF002E6E),
      fontWeight = FontWeight.Black,
      fontSize = 11.sp
    )
  }
}

@Composable
fun BhimLogo(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .size(40.dp)
      .clip(RoundedCornerShape(10.dp))
      .background(SurfaceContainer),
    contentAlignment = Alignment.Center
  ) {
    Icon(
      imageVector = Icons.Default.QrCodeScanner,
      contentDescription = null,
      tint = IndigoSecondary,
      modifier = Modifier.size(22.dp)
    )
  }
}

@Composable
fun DynamicQrCodeView(
  amount: Double,
  vpa: String,
  modifier: Modifier = Modifier
) {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(8.dp),
    modifier = modifier
      .fillMaxWidth()
      .padding(vertical = 8.dp)
  ) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = SurfaceContainerLowest,
      shadowElevation = 3.dp,
      modifier = Modifier.padding(8.dp)
    ) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(16.dp)
      ) {
        Box(
          contentAlignment = Alignment.Center,
          modifier = Modifier
            .size(180.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White)
            .border(1.dp, SurfaceContainerHighest, RoundedCornerShape(12.dp))
            .padding(12.dp)
        ) {
          Canvas(modifier = Modifier.size(150.dp)) {
            val step = size.width / 15f
            // Outer corner target markers
            fun drawFinder(x: Float, y: Float) {
              drawRoundRect(
                color = Color(0xFF131B2E),
                topLeft = Offset(x * step, y * step),
                size = Size(5 * step, 5 * step),
                cornerRadius = CornerRadius(4f, 4f)
              )
              drawRoundRect(
                color = Color.White,
                topLeft = Offset((x + 1) * step, (y + 1) * step),
                size = Size(3 * step, 3 * step),
                cornerRadius = CornerRadius(2f, 2f)
              )
              drawRoundRect(
                color = Color(0xFF131B2E),
                topLeft = Offset((x + 2) * step, (y + 2) * step),
                size = Size(1 * step, 1 * step)
              )
            }
            drawFinder(0f, 0f)
            drawFinder(10f, 0f)
            drawFinder(0f, 10f)

            // Dynamic pseudo QR data cells
            val cells = listOf(
              6 to 1, 7 to 2, 8 to 1, 6 to 3, 7 to 4, 8 to 4,
              2 to 6, 3 to 7, 4 to 6, 5 to 7, 6 to 6, 7 to 7, 8 to 6, 9 to 7, 10 to 6, 11 to 7, 12 to 6,
              6 to 8, 8 to 8, 7 to 9, 6 to 10, 8 to 10,
              11 to 11, 12 to 12, 13 to 11, 10 to 12, 13 to 13, 11 to 14
            )
            cells.forEach { (cx, cy) ->
              drawRect(
                color = Color(0xFF131B2E),
                topLeft = Offset(cx * step, cy * step),
                size = Size(step * 0.9f, step * 0.9f)
              )
            }
          }

          // Center fintech badge
          Box(
            modifier = Modifier
              .size(34.dp)
              .clip(RoundedCornerShape(8.dp))
              .background(SurfaceContainerLowest)
              .border(1.dp, SurfaceContainerHighest, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Payments,
              contentDescription = null,
              tint = EmeraldPrimary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = "Scan with GPay / PhonePe / Paytm",
          style = MaterialTheme.typography.labelSmall,
          color = TextSecondary
        )
      }
    }
  }
}
