package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val TicketSplitLightColorScheme = lightColorScheme(
  primary = EmeraldPrimary,
  onPrimary = EmeraldOnPrimary,
  primaryContainer = EmeraldContainer,
  onPrimaryContainer = EmeraldOnContainer,
  secondary = IndigoSecondary,
  onSecondary = IndigoOnSecondary,
  secondaryContainer = IndigoContainer,
  onSecondaryContainer = IndigoOnSecondaryContainer,
  tertiary = TertiaryOrange,
  onTertiary = EmeraldOnPrimary,
  tertiaryContainer = TertiaryContainer,
  onTertiaryContainer = EmeraldOnContainer,
  background = SurfaceBg,
  onBackground = TextPrimary,
  surface = SurfaceBg,
  onSurface = TextPrimary,
  surfaceVariant = SurfaceContainerHighest,
  onSurfaceVariant = TextSecondary,
  outline = OutlineColor,
  outlineVariant = OutlineVariant,
  error = ErrorRed,
  onError = OnError,
  errorContainer = ErrorContainer,
  onErrorContainer = OnErrorContainer,
)

private val TicketSplitDarkColorScheme = darkColorScheme(
  primary = MintPrimaryFixed,
  onPrimary = MintOnPrimaryFixed,
  primaryContainer = EmeraldContainer,
  onPrimaryContainer = EmeraldOnContainer,
  secondary = IndigoFixedDim,
  onSecondary = IndigoOnSecondaryFixed,
  secondaryContainer = IndigoContainer,
  onSecondaryContainer = IndigoOnSecondaryContainer,
  tertiary = TertiaryFixedDim,
  onTertiary = OnTertiaryFixed,
  background = TextPrimary,
  onBackground = SurfaceBg,
  surface = TextPrimary,
  onSurface = SurfaceBg,
  surfaceVariant = Color(0xFF283044),
  onSurfaceVariant = SurfaceContainerHigh,
  outline = OutlineVariant,
  outlineVariant = OutlineColor,
  error = ErrorContainer,
  onError = OnErrorContainer,
)

@Composable
fun TicketSplitTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) TicketSplitDarkColorScheme else TicketSplitLightColorScheme

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content,
  )
}

// Keep backwards-compatibility alias
@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  TicketSplitTheme(darkTheme = darkTheme, content = content)
}

