<#
  idea-ticker.ps1 - a small always-on-top ticker for ideas.md.

  Shows one idea at a time as a compact title strip. Hover or click to reveal
  the full text, double-click for the next idea, right-click for the menu,
  drag to move, Esc to close.

  Launch it with idea-ticker.vbs. Diagnostics:
    powershell -NoProfile -STA -ExecutionPolicy Bypass -File .\idea-ticker.ps1 -SelfTest
#>

param(
  [int] $Seconds = 8,
  [switch] $SelfTest
)

$ErrorActionPreference = 'Stop'
$logPath = Join-Path $PSScriptRoot 'idea-ticker.log'

function Write-TickerLog {
  param([string] $Message)
  try {
    "$(Get-Date -Format s)  $Message" | Add-Content -LiteralPath $logPath -Encoding UTF8
  } catch { }
}

function Find-IdeasFile {
  $dir = $PSScriptRoot
  while ($dir) {
    $candidate = Join-Path $dir 'ideas.md'
    if (Test-Path -LiteralPath $candidate) { return $candidate }
    $parent = Split-Path -Parent $dir
    if (-not $parent -or $parent -eq $dir) { break }
    $dir = $parent
  }
  return $null
}

function Read-IdeaItems {
  param([string] $Path)
  $result = @()
  if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { return $result }

  # Windows PowerShell 5.1 reads files as ANSI unless told otherwise, which
  # mangles the em dashes and quotes in ideas.md.
  foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
    if ($line -notmatch '^\s*[-*]\s+(?:\[[ xX]\]\s+)?(.+?)\s*$') { continue }
    $raw = $Matches[1].Trim()

    $title = $raw
    $body = ''
    if ($raw -match '^\*\*(.+?)\*\*\s*(?:[\u2014\u2013-]\s*)?(.*)$') {
      $title = $Matches[1].Trim()
      $body = $Matches[2].Trim()
    } elseif ($raw -match '^(.*?)\s+[\u2014\u2013]\s+(.*)$') {
      $title = $Matches[1].Trim()
      $body = $Matches[2].Trim()
    }

    if (-not $body -and $title.Length -gt 72) {
      $body = $title
      $title = $title.Substring(0, 69).TrimEnd() + '...'
    }

    $result += [pscustomobject]@{ Title = $title; Body = $body }
  }
  return $result
}

try {
  Add-Type -AssemblyName PresentationFramework
  Add-Type -AssemblyName PresentationCore
  Add-Type -AssemblyName WindowsBase
  Add-Type -AssemblyName System.Windows.Forms

  $ideasPath = Find-IdeasFile
  if (-not $ideasPath) { throw 'ideas.md was not found above this script.' }

  $items = @(Read-IdeaItems -Path $ideasPath)
  $localPath = Join-Path (Split-Path -Parent $ideasPath) 'ideas.local.md'
  if (Test-Path -LiteralPath $localPath) { $items += @(Read-IdeaItems -Path $localPath) }
  if ($items.Count -eq 0) { $items = @([pscustomobject]@{ Title = 'ideas.md has no bullet items yet.'; Body = '' }) }

  # Fresh status file for every run, so a failed launch is easy to diagnose.
  try { Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue } catch { }
  Write-TickerLog "start  items=$($items.Count)  ideas=$ideasPath"

  [xml] $xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Ideas" WindowStyle="None" AllowsTransparency="True"
        Background="Transparent" Topmost="True" ShowInTaskbar="False"
        SizeToContent="WidthAndHeight" ResizeMode="NoResize">
  <Border Background="#F00E1114" CornerRadius="12" BorderBrush="#4000A3DA"
          BorderThickness="1" MaxWidth="600">
    <Grid>
      <Grid.ColumnDefinitions>
        <ColumnDefinition Width="4" />
        <ColumnDefinition Width="*" />
      </Grid.ColumnDefinitions>
      <Border Grid.Column="0" Background="#00A3DA" CornerRadius="11,0,0,11" />
      <StackPanel Grid.Column="1" Margin="16,11,16,11">
        <Grid>
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*" />
            <ColumnDefinition Width="Auto" />
          </Grid.ColumnDefinitions>
          <TextBlock x:Name="TitleText" Grid.Column="0" TextWrapping="Wrap" MaxWidth="520"
                     FontFamily="Segoe UI, Microsoft YaHei UI" FontSize="17"
                     FontWeight="SemiBold" Foreground="#F2F6F9" Text="..." />
          <TextBlock x:Name="IndexText" Grid.Column="1" Margin="14,5,0,0"
                     FontFamily="Segoe UI" FontSize="11" Foreground="#6C7A88" Text="" />
        </Grid>
        <TextBlock x:Name="BodyText" Margin="0,8,0,0" TextWrapping="Wrap" MaxWidth="520"
                   FontFamily="Segoe UI, Microsoft YaHei UI" FontSize="13.5"
                   Foreground="#AEB9C4" LineHeight="19" Visibility="Collapsed" Text="" />
        <Border x:Name="ProgressTrack" Height="2" Margin="0,10,0,0" CornerRadius="1"
                Background="#1FFFFFFF">
          <Border x:Name="ProgressBar" Height="2" Width="0" CornerRadius="1"
                  HorizontalAlignment="Left" Background="#00A3DA" />
        </Border>
        <TextBlock x:Name="HintText" Margin="0,7,0,0" TextWrapping="Wrap" MaxWidth="520"
                   FontFamily="Segoe UI" FontSize="10" Foreground="#5F6B78"
                   Text="drag - click pins the text - double-click for the next idea - right-click for the menu" />
      </StackPanel>
    </Grid>
  </Border>
</Window>
'@

  $window = [Windows.Markup.XamlReader]::Load((New-Object System.Xml.XmlNodeReader $xaml))
  $titleText = $window.FindName('TitleText')
  $bodyText = $window.FindName('BodyText')
  $indexText = $window.FindName('IndexText')
  $progressTrack = $window.FindName('ProgressTrack')
  $progressBar = $window.FindName('ProgressBar')

  $script:index = 0
  $script:paused = $false
  $script:pinned = $false
  $script:lastClick = [datetime]::MinValue
  $script:dragStart = $null
  $script:dragOrigin = $null
  $script:itemShownAt = [datetime]::Now

  function Show-CurrentIdea {
    $item = $items[$script:index]
    $titleText.Text = $item.Title
    $bodyText.Text = $item.Body
    $indexText.Text = "$($script:index + 1) / $($items.Count)"
    if (-not $item.Body -or -not ($script:pinned -or $window.IsMouseOver)) {
      $bodyText.Visibility = 'Collapsed'
    } else {
      $bodyText.Visibility = 'Visible'
    }
    $script:itemShownAt = [datetime]::Now
  }

  function Show-NextIdea {
    $script:index = ($script:index + 1) % $items.Count
    $script:pinned = $false
    Show-CurrentIdea
  }

  function Set-DetailVisibility {
    param([bool] $Show)
    if ($Show -and $items[$script:index].Body) {
      $bodyText.Visibility = 'Visible'
    } else {
      $bodyText.Visibility = 'Collapsed'
    }
  }

  Show-CurrentIdea

  if ($SelfTest) {
    Write-TickerLog "selftest  items=$($items.Count)  first=$($items[0].Title)"
    Write-Host "ideas file : $ideasPath"
    Write-Host "items      : $($items.Count)"
    Write-Host "first title: $($items[0].Title)"
    Write-Host "xaml       : loaded"
    exit 0
  }

  $window.Add_Loaded({
    $area = [System.Windows.SystemParameters]::WorkArea
    $window.Left = [Math]::Max($area.Left, $area.Right - $window.ActualWidth - 28)
    $window.Top = $area.Top + 28
  })

  # Hover peeks at the body text; clicking pins it.
  $window.Add_MouseEnter({ Set-DetailVisibility $true })
  $window.Add_MouseLeave({ if (-not $script:pinned) { Set-DetailVisibility $false } })

  # Manual drag so that a plain click can still mean "show me the text".
  $window.Add_MouseLeftButtonDown({
    $script:dragStart = [System.Windows.Forms.Cursor]::Position
    $script:dragOrigin = New-Object System.Windows.Point($window.Left, $window.Top)
  })

  $window.Add_MouseMove({
    if (-not $script:dragStart) { return }
    if ([System.Windows.Input.Mouse]::LeftButton -ne 'Pressed') { return }
    $now = [System.Windows.Forms.Cursor]::Position
    $dx = $now.X - $script:dragStart.X
    $dy = $now.Y - $script:dragStart.Y
    if ([Math]::Abs($dx) -lt 3 -and [Math]::Abs($dy) -lt 3) { return }
    $window.Left = $script:dragOrigin.X + $dx
    $window.Top = $script:dragOrigin.Y + $dy
  })

  $window.Add_MouseLeftButtonUp({
    $start = $script:dragStart
    $script:dragStart = $null
    if (-not $start) { return }
    $now = [System.Windows.Forms.Cursor]::Position
    $moved = [Math]::Abs($now.X - $start.X) -gt 4 -or [Math]::Abs($now.Y - $start.Y) -gt 4
    if ($moved) { return }

    $elapsed = ([datetime]::Now - $script:lastClick).TotalMilliseconds
    $script:lastClick = [datetime]::Now
    if ($elapsed -lt 420) {
      Show-NextIdea            # double click
    } else {
      $script:pinned = -not $script:pinned   # single click
      Set-DetailVisibility $script:pinned
    }
  })

  $window.Add_KeyDown({ if ($_.Key -eq 'Escape') { $window.Close() } })

  # Rotate items.
  $rotate = New-Object System.Windows.Threading.DispatcherTimer
  $rotate.Interval = [TimeSpan]::FromSeconds($Seconds)
  $rotate.Add_Tick({ if (-not $script:paused) { Show-NextIdea } })
  $rotate.Start()

  # Progress bar fills between rotations.
  $tick = New-Object System.Windows.Threading.DispatcherTimer
  $tick.Interval = [TimeSpan]::FromMilliseconds(80)
  $tick.Add_Tick({
    if ($script:paused) { $progressBar.Width = 0; return }
    $fraction = ([datetime]::Now - $script:itemShownAt).TotalSeconds / $Seconds
    if ($fraction -lt 0) { $fraction = 0 }
    if ($fraction -gt 1) { $fraction = 1 }
    $progressBar.Width = [Math]::Max(0, $progressTrack.ActualWidth * $fraction)
  })
  $tick.Start()

  $menu = New-Object System.Windows.Controls.ContextMenu

  $nextItem = New-Object System.Windows.Controls.MenuItem
  $nextItem.Header = 'Next idea'
  $nextItem.Add_Click({ Show-NextIdea })
  $menu.Items.Add($nextItem) | Out-Null

  $pauseItem = New-Object System.Windows.Controls.MenuItem
  $pauseItem.Header = 'Pause / resume'
  $pauseItem.Add_Click({ $script:paused = -not $script:paused })
  $menu.Items.Add($pauseItem) | Out-Null

  $pinItem = New-Object System.Windows.Controls.MenuItem
  $pinItem.Header = 'Keep text open'
  $pinItem.Add_Click({
    $script:pinned = -not $script:pinned
    Set-DetailVisibility $script:pinned
  })
  $menu.Items.Add($pinItem) | Out-Null

  $openItem = New-Object System.Windows.Controls.MenuItem
  $openItem.Header = 'Open ideas.md'
  $openItem.Add_Click({ Start-Process -FilePath $ideasPath })
  $menu.Items.Add($openItem) | Out-Null

  $menu.Items.Add((New-Object System.Windows.Controls.Separator)) | Out-Null

  $closeItem = New-Object System.Windows.Controls.MenuItem
  $closeItem.Header = 'Close'
  $closeItem.Add_Click({ $window.Close() })
  $menu.Items.Add($closeItem) | Out-Null

  $window.ContextMenu = $menu
  $window.ShowDialog() | Out-Null
  exit 0
}
catch {
  Write-TickerLog ($_ | Out-String)
  if ($SelfTest) { Write-Host ($_ | Out-String) }
  exit 1
}
