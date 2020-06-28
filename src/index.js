import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const _squaresInit = (() => {

    let ret = []
    let counterRow = 1
    let counterColumn = 1

    for (let i = 0; i < 9; i++) {

        let pushObj = {}
        pushObj.id = i
        pushObj.row = counterRow
        pushObj.column = counterColumn

        counterColumn = counterColumn + 1
        if (counterColumn > 3) {
            counterColumn = 1
        }
        if (((i + 1) % 3) === 0) {
            counterRow = counterRow + 1
            counterColumn = 1
        }

        pushObj.value = null
        pushObj.step = null
        pushObj.colorWin = null
        ret.push(pushObj)
    }
    return ret
})()

function Square(props) {
    const light = props.winner ? 'color-blue' : ''
    return (
        <button className={`square ${light}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props)
        this.squares = this.props.squares
    }

    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i].value}
                onClick={() => this.props.onClick(i)}
                winner={this.props.squares[i].winner}
            />
        );
    }

    board(squares) {
        let ret = []
        for (let i = 0; i < squares.length; i++) {
            let objsSquare = [];
            if (((i + 1) % 3) === 0) {
                objsSquare.push(squares.slice(i - 2, i + 1))
            }
            if (objsSquare.length !== 0) {
                let doneLayout = [];
                for (let c = 0; c < objsSquare[0].length; c++) {
                    doneLayout.push(this.renderSquare(objsSquare[0][c].id))
                }
                ret.push(<div className={'board-row'}>{doneLayout}</div>)
            }
        }

        return ret
    }

    render() {
        return (
            <div>
                {this.board(this.squares)}
            </div>
        );
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            history: [
                {
                    squares: _squaresInit
                }
            ],
            stepNumber: 0,
            xIsNext: true
        };
    }

    calculateWinner(squaresCopy) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squaresCopy[a].value && squaresCopy[a].value === squaresCopy[b].value && squaresCopy[a].value === squaresCopy[c].value) {
                squaresCopy[a].winner = true
                squaresCopy[b].winner = true
                squaresCopy[c].winner = true
                return {winner: squaresCopy[a].value, gameOver: true}
            }
        }
        return null;
    }

    handleClick(i) {

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (this.calculateWinner(squares) || squares[i].value) {
            return;
        }

        //copy squares for immutable (иммутабельность)
        const squaresCopy = (() => {
            let ret = []
            for (let c = 0; c < squares.length; c++) {
                ret.push(Object.assign({}, squares[c]))
            }
            return ret
        })()

        squaresCopy[i].value = this.state.xIsNext ? "X" : "O";

        //Присваиваем шаг по id
        (function (squaresCopy, history) {
            for (let c = 0; c < squaresCopy.length; c++) {
                if (squaresCopy[i].id === i) {
                    squaresCopy[i].step = history.length
                }
            }
            return squaresCopy
        })(squaresCopy, history)

        this.setState({
            history: history.concat([
                {
                    squares: squaresCopy
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.calculateWinner(current.squares)


        const moves = history.map((step, move) => {
            const desc = move ?
                `Go to move ${move}` :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner.winner;
        } else {
            history.length >= 10 ? status = "Game Over" : status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }


        const rowColumnList = (currentSquares) => {
            return history.map((step, index) => {
                let currentSquare = currentSquares.find((square) => {
                    if (square.step === index + 1) {
                        return true
                    }
                })
                if (currentSquare) {
                    return (
                        <li>Row: {currentSquare.row}, Column:{currentSquare.column}</li>
                    )
                }
            })
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        winner={squares => this.calculateWinner(squares)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                    <ol>{rowColumnList(current.squares)}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game/>, document.getElementById("root"));
