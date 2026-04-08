import SwiftUI

struct ContentView: View {
    @StateObject private var game = GameViewModel()

    var body: some View {
        GeometryReader { proxy in
            let boardWidth = min(proxy.size.width - 32, 420)
            let cellSize = boardWidth / CGFloat(game.columns)

            VStack(spacing: 18) {
                header

                BoardView(game: game, cellSize: cellSize)
                    .frame(width: boardWidth, height: cellSize * CGFloat(game.rows))
                    .gesture(
                        DragGesture(minimumDistance: 16)
                            .onEnded { value in
                                handleSwipe(translation: value.translation)
                            }
                    )

                controls

                footer
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
            .background(
                LinearGradient(
                    colors: [
                        Color(red: 0.10, green: 0.12, blue: 0.18),
                        Color(red: 0.03, green: 0.06, blue: 0.10)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            Text("Snake")
                .font(.system(size: 34, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)

            Text("Pontuação: \(game.score)")
                .font(.headline)
                .foregroundStyle(Color.white.opacity(0.9))
        }
    }

    private var controls: some View {
        VStack(spacing: 10) {
            ControlButton(symbol: "arrow.up") {
                game.changeDirection(.up)
            }

            HStack(spacing: 56) {
                ControlButton(symbol: "arrow.left") {
                    game.changeDirection(.left)
                }

                ControlButton(symbol: "arrow.right") {
                    game.changeDirection(.right)
                }
            }

            ControlButton(symbol: "arrow.down") {
                game.changeDirection(.down)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 10) {
            if game.isGameOver {
                Text("Fim de jogo")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)

                Button("Jogar novamente") {
                    game.resetGame()
                }
                .buttonStyle(PrimaryButtonStyle())
            } else if !game.isRunning {
                Button("Começar") {
                    game.startGameIfNeeded()
                }
                .buttonStyle(PrimaryButtonStyle())
            } else {
                Text("Deslize no tabuleiro ou use os botões")
                    .font(.subheadline)
                    .foregroundStyle(Color.white.opacity(0.85))
            }
        }
        .frame(minHeight: 72)
    }

    private func handleSwipe(translation: CGSize) {
        if abs(translation.width) > abs(translation.height) {
            game.changeDirection(translation.width > 0 ? .right : .left)
        } else {
            game.changeDirection(translation.height > 0 ? .down : .up)
        }
    }
}

private struct BoardView: View {
    @ObservedObject var game: GameViewModel
    let cellSize: CGFloat

    var body: some View {
        VStack(spacing: 2) {
            ForEach(0 ..< game.rows, id: \.self) { y in
                HStack(spacing: 2) {
                    ForEach(0 ..< game.columns, id: \.self) { x in
                        let point = GridPoint(x: x, y: y)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(fillColor(for: point))
                            .overlay(
                                RoundedRectangle(cornerRadius: 4)
                                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
                            )
                            .frame(width: cellSize - 2, height: cellSize - 2)
                    }
                }
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.black.opacity(0.28))
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.25), radius: 18, y: 8)
    }

    private func fillColor(for point: GridPoint) -> Color {
        if point == game.food {
            return Color(red: 0.98, green: 0.34, blue: 0.31)
        }

        guard let head = game.snake.first else {
            return Color.white.opacity(0.05)
        }

        if point == head {
            return Color(red: 0.47, green: 0.95, blue: 0.55)
        }

        if game.containsSnake(at: point) {
            return Color(red: 0.18, green: 0.76, blue: 0.39)
        }

        return Color.white.opacity(0.05)
    }
}

private struct ControlButton: View {
    let symbol: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.title2.weight(.bold))
                .frame(width: 62, height: 62)
                .background(Color.white.opacity(0.12))
                .foregroundStyle(.white)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )
        }
    }
}

private struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 22)
            .padding(.vertical, 12)
            .background(
                Capsule()
                    .fill(Color(red: 0.15, green: 0.58, blue: 0.98))
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

#Preview {
    ContentView()
}
