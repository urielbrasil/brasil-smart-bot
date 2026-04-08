import Combine
import Foundation

struct GridPoint: Hashable {
    let x: Int
    let y: Int
}

enum Direction {
    case up
    case down
    case left
    case right

    func isOpposite(to other: Direction) -> Bool {
        switch (self, other) {
        case (.up, .down), (.down, .up), (.left, .right), (.right, .left):
            return true
        default:
            return false
        }
    }
}

@MainActor
final class GameViewModel: ObservableObject {
    let columns = 18
    let rows = 28

    @Published private(set) var snake: [GridPoint] = []
    @Published private(set) var food = GridPoint(x: 0, y: 0)
    @Published private(set) var score = 0
    @Published private(set) var isGameOver = false
    @Published private(set) var isRunning = false

    private var direction: Direction = .right
    private var pendingDirection: Direction = .right
    private var timerCancellable: AnyCancellable?

    init() {
        resetGame()
    }

    func startGameIfNeeded() {
        guard !isRunning else { return }
        isRunning = true
        timerCancellable = Timer.publish(every: 0.14, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.tick()
            }
    }

    func resetGame() {
        timerCancellable?.cancel()
        let centerX = columns / 2
        let centerY = rows / 2
        snake = [
            GridPoint(x: centerX, y: centerY),
            GridPoint(x: centerX - 1, y: centerY),
            GridPoint(x: centerX - 2, y: centerY)
        ]
        direction = .right
        pendingDirection = .right
        score = 0
        isGameOver = false
        isRunning = false
        spawnFood()
    }

    func changeDirection(_ newDirection: Direction) {
        guard !newDirection.isOpposite(to: direction) else { return }
        pendingDirection = newDirection
        startGameIfNeeded()
    }

    func containsSnake(at point: GridPoint) -> Bool {
        snake.contains(point)
    }

    private func tick() {
        guard !isGameOver else { return }

        if !pendingDirection.isOpposite(to: direction) {
            direction = pendingDirection
        }

        guard let head = snake.first else { return }
        let newHead = nextPoint(from: head, moving: direction)

        let hitsWall = newHead.x < 0 || newHead.x >= columns || newHead.y < 0 || newHead.y >= rows
        let hitsSelf = snake.contains(newHead)

        if hitsWall || hitsSelf {
            isGameOver = true
            isRunning = false
            timerCancellable?.cancel()
            return
        }

        snake.insert(newHead, at: 0)

        if newHead == food {
            score += 1
            spawnFood()
        } else {
            snake.removeLast()
        }
    }

    private func nextPoint(from point: GridPoint, moving direction: Direction) -> GridPoint {
        switch direction {
        case .up:
            return GridPoint(x: point.x, y: point.y - 1)
        case .down:
            return GridPoint(x: point.x, y: point.y + 1)
        case .left:
            return GridPoint(x: point.x - 1, y: point.y)
        case .right:
            return GridPoint(x: point.x + 1, y: point.y)
        }
    }

    private func spawnFood() {
        let occupied = Set(snake)
        let available = (0 ..< rows).flatMap { y in
            (0 ..< columns).map { x in GridPoint(x: x, y: y) }
        }.filter { !occupied.contains($0) }

        if let point = available.randomElement() {
            food = point
        }
    }
}
